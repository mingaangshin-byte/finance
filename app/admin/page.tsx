'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [newCatName, setNewCatName] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      alert('질문과 답변을 모두 작성해주세요.');
      return;
    }

    setLoading(true);

    let file_url = '';
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      file_url = data.url;
    }

    const res = await fetch('/api/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        answer,
        category_id: selectedCatId ? Number(selectedCatId) : null,
        new_category_name: newCatName,
        file_url,
      }),
    });

    if (res.ok) {
      alert('성공적으로 등록되었습니다.');
      setQuestion('');
      setAnswer('');
      setNewCatName('');
      setSelectedCatId('');
      setFile(null);
    } else {
      alert('등록에 실패했습니다.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">FAQ 아카이빙 (관리자)</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">카테고리 선택</label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white"
            >
              <option value="">-- 기존 카테고리 선택 --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              또는 새 카테고리 생성 (위에서 선택하지 않은 경우)
            </label>
            <input
              type="text"
              placeholder="예: 투자 자문, 자산 관리"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-red-600">* 질문 (Question)</label>
            <input
              type="text"
              required
              placeholder="어드바이저에게 받은 질문을 입력하세요"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-red-600">* 답변 (Answer)</label>
            <textarea
              required
              rows={6}
              placeholder="어드바이저님의 답변을 정확히 기록하세요"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">첨부파일 (Vercel Blob)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? '저장 중...' : '어드바이저 질의응답 등록'}
          </button>
        </form>
      </div>
    </main>
  );
}