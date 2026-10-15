'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category_name: string;
  file_url?: string;
}

export default function HomePage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetch('/api/faqs')
      .then((res) => res.json())
      .then((data: FAQ[]) => {
        if (Array.isArray(data)) {
          setFaqs(data);
          const cats = Array.from(new Set(data.map((item) => item.category_name).filter(Boolean)));
          setCategories(cats);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category_name === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <main className="min-h-screen py-16 px-4 max-w-xl mx-auto flex flex-col items-center">
      {/* 상단 챗봇 연결 바너 / 메뉴 버튼 */}
      <div className="w-full mb-8">
        <Link
          href="/chat"
          className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition flex justify-between items-center group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="font-bold text-sm">실시간 AI 고객상담 챗봇</div>
              <div className="text-xs text-gray-300">궁금한 점을 AI에게 바로 물어보세요!</div>
            </div>
          </div>
          <span className="text-xs font-semibold bg-white/20 group-hover:bg-white group-hover:text-black text-white px-3 py-1.5 rounded-full transition">
            상담 시작하기 →
          </span>
        </Link>
      </div>

      <div className="bg-[#E3E5DF] text-gray-700 text-xs tracking-widest font-semibold px-4 py-1.5 rounded-full mb-6 uppercase">
        F.A.Q
      </div>

      <h1 className="text-4xl md:text-5xl font-serif text-center mb-8 text-gray-900 tracking-tight leading-tight">
        Questions People<br />Often Ask
      </h1>

      {/* 검색창 */}
      <div className="w-full relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          placeholder="질문이나 답변 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-gray-900 placeholder-gray-400 pl-11 pr-10 py-3 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black text-sm transition border border-gray-100"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            selectedCategory === 'All'
              ? 'bg-black text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              selectedCategory === cat
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ 리스트 */}
      <div className="w-full flex flex-col gap-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            검색 결과가 없습니다.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="w-full">
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full bg-white rounded-2xl p-5 flex justify-between items-center text-left shadow-sm hover:shadow-md transition duration-200"
                >
                  <span className="font-serif text-lg text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <span className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 shrink-0 font-bold text-base">
                    {isOpen ? '✕' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-2 bg-[#E2E6DF] rounded-2xl p-6 text-gray-800 leading-relaxed text-sm font-sans">
                    <p className="whitespace-pre-wrap">{faq.answer}</p>
                    {faq.file_url && (
                      <div className="mt-4 pt-3 border-t border-gray-300/50">
                        <a
                          href={faq.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-gray-700 underline hover:text-black"
                        >
                          📎 첨부파일/자료 보기
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}