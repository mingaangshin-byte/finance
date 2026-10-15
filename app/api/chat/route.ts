import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY environment variable is not set.' }, { status: 500 });
    }

    const userMessage = messages[messages.length - 1]?.content || '';

    // Neon DB에서 질문/답변 지식베이스 검색 (RAG)
    const faqs = await sql`
      SELECT f.question, f.answer, c.name as category_name
      FROM faqs f
      LEFT JOIN categories c ON f.category_id = c.id
    `;

    const context = faqs
      .map((f: any) => `[카테고리: ${f.category_name || '기타'}]\nQ: ${f.question}\nA: ${f.answer}`)
      .join('\n\n');

    const systemInstruction = `당신은 리모(Rimo) 협동조합의 세무/회계 및 조합 운영 전문 고객상담 AI 챗봇입니다.
아래에 제공된 지식베이스(FAQ 문서)의 내용을 바탕으로 사용자의 질문에 친절하고 정확하며 명확하게 답변해 주세요.

[참고 지식베이스]
${context}

[답변 지침]
1. 지식베이스에 포함된 내용을 기반으로 답변하세요.
2. 답변할 수 없는 사안이거나 법적/세무적으로 고도의 판단이 필요한 경우, "전문 세무사/회계사와의 직접 상담을 권장합니다"라는 안내를 덧붙이세요.
3. 친절하고 간결한 어조(해요체)로 답변하세요.
4. 핵심 내용은 가독성 있게 목록이나 강조 표시를 활용하세요.`;

    const ai = new GoogleGenAI({ apiKey });

    // Gemini 2.5 Flash Lite 모델 호출
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        ...messages.slice(0, -1).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const reply = response.text || '죄송합니다. 답변을 생성하지 못했습니다.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error?.message || 'Chat API Internal Error' }, { status: 500 });
  }
}