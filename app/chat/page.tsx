'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '안녕하세요! 리모(Rimo) 협동조합 상담 AI 챗봇입니다. 🤖\n세무, 회계, 지출증빙, 인증서, 펀딩 등 궁금하신 점을 무엇이든 물어보세요!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '⚠️ 답변 생성 중 오류가 발생했습니다. 환경변수(GEMINI_API_KEY) 설정을 확인해 주세요.' },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F4F2] flex flex-col items-center py-8 px-4">
      {/* 상단 네비게이션 */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <Link
          href="/"
          className="text-xs font-semibold text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm hover:bg-gray-100 transition"
        >
          ← FAQ 아카이브로 돌아가기
        </Link>
        <div className="bg-[#E3E5DF] text-gray-700 text-xs tracking-widest font-semibold px-4 py-1.5 rounded-full uppercase">
          RAG Chatbot
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[75vh] overflow-hidden">
        {/* 챗봇 헤더 */}
        <div className="p-5 border-b border-gray-100 bg-[#E3E5DF]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg">
              🤖
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">리모 AI 상담원</h2>
              <p className="text-xs text-gray-500">Gemini 2.5 Flash Lite 기반 RAG 챗봇</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            운영 중
          </span>
        </div>

        {/* 대화 영역 */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-[#F4F4F2]/30">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-tr-none'
                    : 'bg-[#E2E6DF] text-gray-900 rounded-tl-none border border-gray-200/50 shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#E2E6DF] text-gray-600 p-4 rounded-2xl rounded-tl-none text-sm flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                <span className="text-xs font-medium ml-1">답변을 작성하는 중...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            placeholder="질문을 입력하세요 (예: 텀블벅 펀딩 모금액도 부가세 신고 해야 하나요?)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-gray-50 text-gray-900 placeholder-gray-400 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black border border-gray-200 transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-black text-white px-6 py-3 rounded-2xl font-medium text-sm hover:bg-gray-800 transition disabled:opacity-40 shrink-0"
          >
            전송
          </button>
        </form>
      </div>
    </main>
  );
}