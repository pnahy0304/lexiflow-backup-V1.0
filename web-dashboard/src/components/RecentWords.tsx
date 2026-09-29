import React from 'react';
import { ArrowRight, Volume2, Bookmark } from 'lucide-react';
import { recentWords } from '../data';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export const RecentWords: React.FC = () => {
  const playAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Từ Vựng Vừa Tra Cứu
            </h3>
            <Badge variant="slate" size="sm" pill>Lịch sử 24h</Badge>
          </div>
          <button className="text-[12.5px] font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline flex items-center gap-1 transition-colors">
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.3]" />
          </button>
        </div>

        {/* Word List */}
        <div className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
          {recentWords.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60 px-2.5 rounded-xl transition-all group"
            >
              {/* Left: Image & Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={item.imageUrl}
                  alt={item.word}
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-[#E2E8F0] dark:border-[#334155] shadow-xs group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-[15px] text-[#0F172A] dark:text-[#F8FAFC] capitalize truncate tracking-tight">
                      {item.word}
                    </span>
                    <Badge variant="indigo" size="sm">{item.partOfSpeech}</Badge>
                    <Badge variant="emerald" size="sm">B2 · Oxford</Badge>
                  </div>
                  <span className="text-[12.5px] text-[#64748B] dark:text-[#CBD5E1] truncate mt-0.5 font-medium">
                    {item.meaning}
                  </span>
                </div>
              </div>

              {/* Right: Timestamp & Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-[#94A3B8] hidden sm:inline mr-1">
                  {item.timeAgo}
                </span>
                <button
                  onClick={() => playAudio(item.word)}
                  aria-label={`Nghe phát âm từ ${item.word}`}
                  className="p-2 text-[#4F46E5] dark:text-[#818CF8] hover:bg-[#EEF2FF] dark:hover:bg-[#4F46E5]/20 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                  title="Nghe phát âm IPA"
                >
                  <Volume2 className="w-4 h-4 stroke-[2]" />
                </button>
                <button 
                  aria-label={`Lưu từ ${item.word}`}
                  className="p-2 text-[#94A3B8] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#EEF2FF] dark:hover:bg-[#4F46E5]/20 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                  title="Lưu từ này"
                >
                  <Bookmark className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
