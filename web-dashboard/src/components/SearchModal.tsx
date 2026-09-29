import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Layers, Camera, CheckSquare, ArrowRight, Sparkles } from 'lucide-react';
import { recentWords } from '../data';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (tabId: string, word?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredWords = recentWords.filter(
    (w) =>
      w.word.toLowerCase().includes(query.toLowerCase()) ||
      w.meaning.toLowerCase().includes(query.toLowerCase())
  );

  const tools = [
    { id: 'dictionary', title: 'Từ điển Oxford & TFLAT', desc: 'Tra từ, IPA sound, ví dụ ngữ cảnh', icon: <BookOpen className="w-4 h-4 text-[#4F46E5]" /> },
    { id: 'flashcards', title: 'Thẻ ghi nhớ SM-2', desc: 'Học lặp lại ngắt quãng khoa học', icon: <Layers className="w-4 h-4 text-[#059669]" /> },
    { id: 'ocr', title: 'Quét Camera OCR AI', desc: 'Nhận diện từ vựng trực tiếp từ trang sách', icon: <Camera className="w-4 h-4 text-amber-500" /> },
    { id: 'quiz', title: 'Trắc nghiệm từ vựng', desc: 'Thử thách phản xạ & ghi nhớ', icon: <CheckSquare className="w-4 h-4 text-[#7C3AED]" /> }
  ].filter((t) => t.title.toLowerCase().includes(query.toLowerCase()) || t.desc.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div
        className="bg-white rounded-2xl border border-[#E6ECF5] shadow-2xl max-w-[640px] w-full overflow-hidden animate-pop-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-[#E6ECF5] p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#4F46E5] stroke-[2.2]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ vựng, tính năng hoặc ví dụ cần tra..."
            className="flex-1 bg-transparent text-[16px] font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:bg-[#F6F8FC] hover:text-[#0F172A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[420px] overflow-y-auto flex flex-col gap-5">
          {/* Words Section */}
          {filteredWords.length > 0 && (
            <div>
              <span className="text-[10.5px] font-mono font-bold text-[#64748B] uppercase tracking-wider block mb-2.5">
                Từ vựng gợi ý Oxford ({filteredWords.length})
              </span>
              <div className="flex flex-col gap-1.5">
                {filteredWords.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectResult('dictionary', item.word);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF2FF] border border-transparent hover:border-[#C7D2FE] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3.5">
                      <img src={item.imageUrl} alt={item.word} className="w-9 h-9 rounded-xl object-cover border border-[#E6ECF5]" />
                      <div>
                        <div className="font-extrabold text-[14.5px] text-[#0F172A] capitalize group-hover:text-[#4F46E5] transition-colors">{item.word}</div>
                        <div className="text-[12px] text-[#64748B] font-medium">{item.meaning}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#4F46E5] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all stroke-[2.3]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tools & Features Section */}
          {tools.length > 0 && (
            <div>
              <span className="text-[10.5px] font-mono font-bold text-[#64748B] uppercase tracking-wider block mb-2.5">
                Không Gian Tính Năng Studio
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tools.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectResult(t.id);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F8FC] border border-[#E6ECF5] hover:border-[#C7D2FE] hover:bg-[#EEF2FF] transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E6ECF5] flex items-center justify-center shrink-0 shadow-xs">
                      {t.icon}
                    </div>
                    <div>
                      <div className="font-bold text-[13.5px] text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">{t.title}</div>
                      <div className="text-[11.5px] text-[#64748B]">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredWords.length === 0 && tools.length === 0 && (
            <div className="py-8 text-center text-[#64748B] text-[14px] flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>Không tìm thấy từ vựng nào phù hợp với "{query}"</span>
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="bg-[#F6F8FC] px-4 py-3 border-t border-[#E6ECF5] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <span>Mẹo: Sử dụng phím Enter để chọn nhanh kết quả</span>
          <span className="font-bold text-[#4F46E5]">Nhấn ESC để đóng</span>
        </div>
      </div>
    </div>
  );
};

