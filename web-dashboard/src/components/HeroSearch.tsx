import React, { useState } from 'react';
import { Search, ArrowRight, Camera, Volume2, Sparkles } from 'lucide-react';
import { quickSearchTags } from '../data';
import { Button } from './ui/Button';

interface HeroSearchProps {
  onSearch?: (word: string) => void;
  onOpenOcr?: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, onOpenOcr }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <section aria-label="Khung tra cứu từ vựng" className="relative w-full rounded-3xl overflow-hidden shadow-xl mb-6 flex flex-col justify-between p-6 sm:p-8 select-none border border-white/10 bg-[#0F172A] text-white">
      {/* Background Graphic & Dark Obsidian Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-20 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1400')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-[#1E1B4B]/80 z-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F46E5]/25 rounded-full blur-3xl z-0 pointer-events-none" />

      {/* Top Banner Text */}
      <div className="relative z-10 max-w-4xl mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#A5B4FC] text-[11px] font-mono font-bold uppercase tracking-wider mb-3 ring-1 ring-white/15">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tra Cứu Từ Điển Chuẩn Oxford & IPA Phonic</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
          Tra cứu chuyên sâu. Ghi nhớ lâu dài cùng <span className="font-serif-craft italic text-[#818CF8]">SM-2 Spaced Repetition</span>
        </h2>
        <p className="text-[14px] text-slate-300 mt-2 font-medium max-w-2xl leading-relaxed">
          Truy xuất định nghĩa chuẩn Oxford, 20.000+ câu ví dụ thực tế, phiên âm IPA giọng Anh-Mỹ và máy quét OCR trí tuệ nhân tạo.
        </p>
      </div>

      {/* Hero Search Box & Quick Discovery Pills */}
      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-3.5">
        {/* Main Search Input */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] p-2 rounded-2xl shadow-xl border border-white/20 max-w-3xl focus-within:ring-2 focus-within:ring-[#818CF8]">
          <div className="pl-3.5 text-[#4F46E5] dark:text-[#818CF8] shrink-0">
            <Search className="w-5 h-5 stroke-[2.3]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nhập từ vựng tiếng Anh (ví dụ: environment, Resilience, Empathy)..."
            className="flex-1 min-w-0 bg-transparent text-[14.5px] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none px-2 font-semibold truncate"
          />
          
          <button 
            type="button"
            onClick={onOpenOcr}
            className="p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] hover:bg-[#EEF2FF] dark:hover:bg-[#4F46E5]/30 text-[#4F46E5] dark:text-[#818CF8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] shrink-0"
            title="Quét từ vựng từ ảnh (OCR)"
          >
            <Camera className="w-4.5 h-4.5 stroke-[2]" />
          </button>
          
          <button 
            type="button"
            className="p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] hover:bg-[#EEF2FF] dark:hover:bg-[#4F46E5]/30 text-[#4F46E5] dark:text-[#818CF8] transition-colors hidden sm:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] shrink-0"
            title="Phát âm giọng Anh-Mỹ"
          >
            <Volume2 className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          <Button type="submit" variant="gradient" size="md" className="shrink-0 whitespace-nowrap" rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.5]" />}>
            Tra Từ
          </Button>
        </div>

        {/* Quick Discovery Tags */}
        <div className="flex items-center gap-2 text-slate-300 text-[12px] flex-wrap pt-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#A5B4FC] font-semibold">Từ hot hôm nay:</span>
          {quickSearchTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchTerm(tag);
                if (onSearch) onSearch(tag);
              }}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg font-medium transition-all border border-white/15 text-[11.5px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#818CF8]"
            >
              <span>{tag}</span>
              <span className="text-[10px] font-mono text-indigo-300 opacity-80">IPA</span>
            </button>
          ))}
        </div>
      </form>
    </section>
  );
};
