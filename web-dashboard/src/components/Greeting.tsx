import React from 'react';
import type { UserProfile } from '../data';
import { Calendar, Sparkles } from 'lucide-react';
import { Badge } from './ui/Badge';

interface GreetingProps {
  user: UserProfile;
}

export const Greeting: React.FC<GreetingProps> = ({ user }) => {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 pt-1 font-sans">
      <div className="flex flex-col gap-1.5 max-w-3xl">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="indigo" size="sm" pill>
            Oxford Studio
          </Badge>
          <span className="text-[12px] text-[#94A3B8]">·</span>
          <span className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">Học tập chủ động</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-snug md:leading-tight">
          Chào buổi sáng, <span className="text-[#4F46E5] dark:text-[#818CF8] font-serif-craft italic font-semibold">{user.name}</span>
        </h1>
        <p className="text-[14px] text-[#64748B] dark:text-[#CBD5E1] font-medium leading-relaxed mt-0.5">
          Khám phá từ vựng Oxford mới hôm nay và củng cố trí nhớ với thuật toán lặp lại ngắt quãng SM-2.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-[#1E293B] px-4 py-2.5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center shrink-0">
          <Calendar className="w-4.5 h-4.5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col text-left whitespace-nowrap">
          <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-tight">
            Thứ Ba, 29/09/2026
          </span>
          <span className="text-[11px] font-mono text-[#059669] dark:text-[#34D399] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Mục tiêu: 15 từ / ngày
          </span>
        </div>
      </div>
    </section>
  );
};
