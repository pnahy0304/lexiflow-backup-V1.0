import React from 'react';
import { ArrowRight, BookOpen, CheckSquare, Bookmark, Activity } from 'lucide-react';
import { recentActivities } from '../data';
import { Card } from './ui/Card';

export const RecentActivity: React.FC = () => {
  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'search':
        return {
          icon: <BookOpen className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />,
          bg: 'bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200/60 dark:border-emerald-500/30'
        };
      case 'quiz':
        return {
          icon: <CheckSquare className="w-4 h-4 text-[#7C3AED] dark:text-[#A78BFA]" />,
          bg: 'bg-purple-50 dark:bg-purple-500/20 border border-purple-200/60 dark:border-purple-500/30'
        };
      case 'bookmark':
        return {
          icon: <Bookmark className="w-4 h-4 text-[#E11D48] dark:text-[#FB7185]" />,
          bg: 'bg-rose-50 dark:bg-rose-500/20 border border-rose-200/60 dark:border-rose-500/30'
        };
      default:
        return {
          icon: <BookOpen className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />,
          bg: 'bg-[#EEF2FF] dark:bg-[#4F46E5]/20 border border-[#C7D2FE]/60 dark:border-[#4F46E5]/30'
        };
    }
  };

  return (
    <Card className="p-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-[#4F46E5] dark:text-[#818CF8]" />
          <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Nhật Ký Hoạt Động
          </h3>
        </div>
        <button className="text-[12.5px] font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline flex items-center gap-1 transition-colors">
          <span>Tất cả</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.3]" />
        </button>
      </div>

      {/* Activity List */}
      <div className="flex flex-col gap-2.5">
        {recentActivities.map((act) => {
          const badge = getActivityBadge(act.type);
          return (
            <div
              key={act.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60 border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#334155] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg ${badge.bg} flex items-center justify-center shrink-0`}>
                  {badge.icon}
                </div>
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {act.title}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#94A3B8] shrink-0">
                {act.timeAgo}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
