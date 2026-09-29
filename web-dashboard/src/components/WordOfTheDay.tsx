import React, { useState } from 'react';
import { RotateCw, Volume2, Bookmark, Sparkles } from 'lucide-react';
import { wordOfTheDay as initialData } from '../data';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export const WordOfTheDay: React.FC = () => {
  const [bookmarked, setBookmarked] = useState(false);
  const [data, setData] = useState(initialData);

  const alternateWords = [
    {
      word: "serendipity",
      phonetic: "/ˌserənˈdɪpəti/",
      partOfSpeech: "noun",
      definitionOxford: "the occurrence and development of events by chance in a happy way.",
      definitionTflat: "sự tình cờ may mắn",
      example: "Her meeting with the investor was a serendipity that changed her life.",
      highlightKeyword: "serendipity",
      paperNote: "Good things take time.",
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600"
    },
    {
      word: "meticulous",
      phonetic: "/məˈtɪkjələs/",
      partOfSpeech: "adjective",
      definitionOxford: "showing great attention to detail; very careful and precise.",
      definitionTflat: "tỉ mỉ, cẩn thận",
      example: "He was meticulous about keeping his vocabulary notes organized.",
      highlightKeyword: "meticulous",
      paperNote: "Precision makes perfection.",
      coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const handleRefresh = () => {
    const nextIndex = data.word === alternateWords[0].word ? 1 : 0;
    setData(alternateWords[nextIndex]);
  };

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(data.word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Từ Vựng Tiêu Điểm
            </h3>
          </div>
          <button
            onClick={handleRefresh}
            aria-label="Đổi từ vựng tiêu điểm"
            className="text-[12px] font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            <span>Đổi từ</span>
            <RotateCw className="w-3.5 h-3.5 stroke-[2.3]" />
          </button>
        </div>

        {/* Cover Photo */}
        <div className="relative w-full h-[110px] rounded-xl overflow-hidden mb-3 border border-[#E2E8F0] dark:border-[#334155] group">
          <img
            src={data.coverImage}
            alt={data.word}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/30 to-transparent flex items-end p-3">
            <span className="text-white font-serif-craft italic text-2xl drop-shadow-sm capitalize">
              {data.word}
            </span>
          </div>
        </div>

        {/* Word Phonetic & POS */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[13px] font-mono text-[#64748B] dark:text-[#94A3B8] font-semibold">
            {data.phonetic}
          </span>
          <button
            onClick={playAudio}
            aria-label={`Nghe phát âm ${data.word}`}
            className="p-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] hover:bg-[#4F46E5] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
            title="Nghe phát âm IPA"
          >
            <Volume2 className="w-3.5 h-3.5 stroke-[2]" />
          </button>
          <Badge variant="indigo" size="sm">{data.partOfSpeech}</Badge>
          <span className="text-[12.5px] font-bold text-[#059669] dark:text-[#34D399] ml-auto">
            {data.definitionTflat}
          </span>
        </div>

        {/* Example Sentence */}
        <p className="text-[13px] text-[#334155] dark:text-[#E2E8F0] bg-[#F8FAFC] dark:bg-[#1E293B]/60 p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] font-serif-craft italic leading-relaxed mb-3">
          "{data.example.split(data.highlightKeyword).map((part, index, array) => (
            <React.Fragment key={index}>
              {part}
              {index < array.length - 1 && (
                <strong className="font-bold text-[#4F46E5] dark:text-[#818CF8] not-italic underline decoration-wavy decoration-[#4F46E5]/40 font-sans">
                  {data.highlightKeyword}
                </strong>
              )}
            </React.Fragment>
          ))}"
        </p>
      </div>

      {/* Action Button */}
      <Button
        variant={bookmarked ? 'secondary' : 'outline'}
        size="md"
        onClick={() => setBookmarked(!bookmarked)}
        leftIcon={<Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current text-[#059669]' : ''}`} />}
        className="w-full"
      >
        {bookmarked ? 'Đã lưu vào bộ nhớ' : 'Lưu vào thẻ ghi nhớ SM-2'}
      </Button>
    </Card>
  );
};
