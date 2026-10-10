'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

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

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter((f) => f.category_name === selectedCategory);

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <main className="min-h-screen py-16 px-4 max-w-xl mx-auto flex flex-col items-center">
      <div className="bg-[#E3E5DF] text-gray-700 text-xs tracking-widest font-semibold px-4 py-1.5 rounded-full mb-6 uppercase">
        F.A.Q
      </div>

      <h1 className="text-4xl md:text-5xl font-serif text-center mb-8 text-gray-900 tracking-tight leading-tight">
        Questions People<br />Often Ask
      </h1>

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

      <div className="w-full flex flex-col gap-3">
        {filteredFaqs.map((faq) => {
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
                <span className="bg-gray-100 p-2 rounded-full text-gray-600 shrink-0">
                  {isOpen ? <X size={18} /> : <Plus size={18} />}
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
        })}
      </div>
    </main>
  );
}