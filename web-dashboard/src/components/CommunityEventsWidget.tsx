import React, { useState } from 'react';
import { Trophy, ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { initialEvents } from './views/AdminEventsView';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export const CommunityEventsWidget: React.FC<{ onSelectEvent?: (id: string) => void }> = () => {
  const [joinedEvents, setJoinedEvents] = useState<Record<string, boolean>>({
    'evt-1': true
  });

  const activeEvents = initialEvents.filter((e) => e.status === 'active' || e.status === 'upcoming');

  const toggleJoin = (id: string) => {
    setJoinedEvents((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold ring-1 ring-amber-500/20">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-[#0F172A] dark:text-[#F8FAFC]">Sự Kiện & Thách Đấu</h3>
              <Badge variant="rose" size="sm" pill>HOT 🔥</Badge>
            </div>
            <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Tham gia cùng 4,280+ học viên LexiFlow</span>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeEvents.map((evt) => {
          const isJoined = !!joinedEvents[evt.id];
          return (
            <div
              key={evt.id}
              className="bg-[#F8FAFC] dark:bg-[#1E293B]/60 rounded-2xl p-4 border border-[#E2E8F0] dark:border-[#334155] hover:border-[#818CF8]/50 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="flex gap-3">
                <img
                  src={evt.bannerUrl}
                  alt={evt.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#E2E8F0] dark:border-[#334155]"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <Badge variant="indigo" size="sm">{evt.category}</Badge>
                    <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      {evt.startDate} → {evt.endDate}
                    </span>
                  </div>
                  <h4 className="font-serif-craft font-bold text-[15px] text-[#0F172A] dark:text-[#F8FAFC] line-clamp-1 group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                    {evt.title}
                  </h4>
                  <p className="text-[12px] text-[#64748B] dark:text-[#CBD5E1] line-clamp-2 mt-0.5">
                    {evt.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center gap-3 text-[11.5px] font-mono">
                  <span className="text-[#4F46E5] dark:text-[#818CF8] font-bold">+{evt.xpReward} XP</span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {evt.participantsCount}
                  </span>
                </div>

                <Button
                  variant={isJoined ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleJoin(evt.id)}
                  leftIcon={isJoined ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : undefined}
                  rightIcon={!isJoined ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
                >
                  {isJoined ? 'Đã Tham Gia' : 'Tham Gia ngay'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
