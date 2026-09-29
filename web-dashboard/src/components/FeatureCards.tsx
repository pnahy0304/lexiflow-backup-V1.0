import React from 'react';
import { ArrowRight, BookOpen, Layers, Camera, CheckSquare, Sparkles } from 'lucide-react';
import { featureCards } from '../data';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface FeatureCardsProps {
  onSelectFeature?: (id: string) => void;
}

const iconComponentMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-5 h-5 stroke-[2.2]" />,
  Layers: <Layers className="w-5 h-5 stroke-[2.2]" />,
  Camera: <Camera className="w-5 h-5 stroke-[2.2]" />,
  CheckSquare: <CheckSquare className="w-5 h-5 stroke-[2.2]" />
};

export const FeatureCards: React.FC<FeatureCardsProps> = ({ onSelectFeature }) => {
  return (
    <section aria-label="Trung tâm học tập Bento" className="mb-6 font-sans">
      <div className="flex items-center justify-between mb-4 px-0.5">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Trung Tâm Học Tập Studio
          </h3>
          <Badge variant="indigo" size="sm" pill>Bento Grid</Badge>
        </div>
        <span className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">
          Chọn một không gian để mở rộng tri thức
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {featureCards.map((card) => (
          <Card
            key={card.id}
            variant="interactive"
            onClick={() => onSelectFeature && onSelectFeature(card.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectFeature && onSelectFeature(card.id)}
            aria-label={card.title}
            className="group p-5 flex flex-col justify-between relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
          >
            {/* Top subtle highlight gradient on hover */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#4F46E5] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shadow-xs ring-1 ring-black/5 group-hover:scale-105 transition-transform`}>
                  {iconComponentMap[card.iconName]}
                </div>
                <Sparkles className="w-4 h-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-all" />
              </div>

              <h4 className="text-[16px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5 leading-snug tracking-tight">
                {card.title}
              </h4>
              <p className="text-[12.5px] text-[#64748B] dark:text-[#CBD5E1] leading-relaxed line-clamp-2">
                {card.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
              <span>{card.actionText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.3]" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
