import React, { useState } from 'react';
import { Camera, Upload, Volume2, Star, Bookmark, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface OcrWord {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  tflatDef: string;
  oxfordDef: string;
  example: string;
  top: string;
  left: string;
  width: string;
}

const ocrWordsList: OcrWord[] = [
  {
    word: 'future',
    phonetic: '/ˈfjuːtʃər/',
    partOfSpeech: 'noun',
    tflatDef: 'tương lai',
    oxfordDef: 'the time that will come after the present.',
    example: 'The future of technology is bright and full of potential.',
    top: '22%',
    left: '26%',
    width: '18%'
  },
  {
    word: 'believe',
    phonetic: '/bɪˈliːv/',
    partOfSpeech: 'verb',
    tflatDef: 'tin tưởng, tin rằng',
    oxfordDef: 'accept something as true, real, or sure.',
    example: 'I believe in your potential to master English.',
    top: '36%',
    left: '46%',
    width: '20%'
  },
  {
    word: 'beauty',
    phonetic: '/ˈbjuːti/',
    partOfSpeech: 'noun',
    tflatDef: 'vẻ đẹp, nét đẹp',
    oxfordDef: 'the quality of being pleasing and attractive.',
    example: 'The beauty of nature always inspires deep thought.',
    top: '49%',
    left: '28%',
    width: '19%'
  },
  {
    word: 'dreams',
    phonetic: '/driːmz/',
    partOfSpeech: 'noun',
    tflatDef: 'ước mơ, giấc mơ',
    oxfordDef: 'a cherished aspiration, ambition, or ideal.',
    example: 'Follow your dreams with relentless passion.',
    top: '64%',
    left: '18%',
    width: '22%'
  }
];

export const OcrView: React.FC = () => {
  const [selectedWord, setSelectedWord] = useState<OcrWord>(ocrWordsList[2]);
  const [bookmarked, setBookmarked] = useState(false);

  const playAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto flex flex-col gap-6 font-sans animate-fade-in">
      {/* Header Banner */}
      <Card className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
            <Camera className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Máy Quét Từ Vựng Camera OCR AI</h2>
              <Badge variant="amber" size="sm" pill>AI Vision</Badge>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium">Chụp hoặc tải ảnh trang sách để nhận diện từ vựng tiếng Anh tức thì.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" leftIcon={<Upload className="w-4 h-4" />}>
            Tải ảnh lên
          </Button>
          <Button variant="gradient" size="md" leftIcon={<Camera className="w-4 h-4" />}>
            Chụp ảnh mới
          </Button>
        </div>
      </Card>

      {/* Main OCR Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Image Canvas (7 cols) */}
        <Card className="lg:col-span-7 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            <span className="flex items-center gap-1.5 text-[#059669] dark:text-[#34D399]">
              <Sparkles className="w-4 h-4" />
              Đã nhận diện 4 từ vựng (Bấm vào từ trên ảnh để tra nghĩa)
            </span>
            <Badge variant="indigo" size="sm">AI Engine v2.0</Badge>
          </div>

          {/* Interactive Document Image Container */}
          <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] select-none bg-stone-950 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"
              alt="OCR Document Page"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />

            {/* Render OCR Word Highlights */}
            {ocrWordsList.map((item) => {
              const isSelected = selectedWord.word === item.word;
              return (
                <button
                  key={item.word}
                  onClick={() => setSelectedWord(item)}
                  style={{ top: item.top, left: item.left, width: item.width }}
                  className={`absolute h-9 rounded-lg border-2 font-bold text-[14.5px] font-sans flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#818CF8] ${
                    isSelected
                      ? 'bg-[#4F46E5]/90 border-[#818CF8] text-white shadow-lg scale-105 ring-4 ring-[#4F46E5]/40 z-20'
                      : 'bg-[#4F46E5]/35 hover:bg-[#4F46E5]/70 border-[#818CF8]/80 text-white backdrop-blur-xs z-10'
                  }`}
                >
                  {item.word}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            <span>Chế độ: Bounding Box Extraction</span>
            <span className="text-[#059669] dark:text-[#34D399] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Độ chính xác: 99.4%
            </span>
          </div>
        </Card>

        {/* Right Column: Instant Dictionary Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <span className="text-[11px] font-mono font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Kết Quả Tra Từ Trực Tiếp
              </span>
              <Badge variant="indigo" size="sm">{selectedWord.partOfSpeech}</Badge>
            </div>

            {/* Word Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] capitalize tracking-tight">
                  {selectedWord.word}
                </h3>
                <div className="flex items-center gap-2 text-[14px] font-mono font-semibold text-[#64748B] dark:text-[#94A3B8] mt-1">
                  <span>{selectedWord.phonetic}</span>
                  <button
                    onClick={() => playAudio(selectedWord.word)}
                    className="p-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] hover:bg-[#4F46E5] hover:text-white transition-colors"
                  >
                    <Volume2 className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/20 rounded-xl transition-colors border border-amber-200 dark:border-amber-500/30"
              >
                <Star className={`w-5 h-5 ${bookmarked ? 'fill-amber-500' : ''}`} />
              </button>
            </div>

            {/* TFLAT Translation */}
            <div className="bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 rounded-2xl">
              <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 block mb-1 uppercase tracking-wider">Dịch Nghĩa (TFLAT):</span>
              <span className="text-xl font-extrabold text-emerald-950 dark:text-emerald-200">{selectedWord.tflatDef}</span>
            </div>

            {/* Oxford Definition */}
            <div className="bg-[#F8FAFC] dark:bg-[#0B0F19]/40 border border-[#E2E8F0] dark:border-[#334155] p-3.5 rounded-2xl">
              <span className="text-[11px] font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1 uppercase tracking-wider">Định Nghĩa (Oxford):</span>
              <p className="text-[13.5px] text-[#334155] dark:text-[#CBD5E1] font-serif-craft italic leading-relaxed">{selectedWord.oxfordDef}</p>
            </div>

            {/* Example */}
            <div className="bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 p-3.5 rounded-2xl text-[13.5px] text-amber-950 dark:text-amber-200 font-serif-craft italic">
              Ví dụ: "{selectedWord.example}"
            </div>

            {/* Bookmark CTA Button */}
            <Button variant="primary" size="md" leftIcon={<Bookmark className="w-4 h-4" />}>
              Lưu từ này vào thẻ ghi nhớ SM-2
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
};
