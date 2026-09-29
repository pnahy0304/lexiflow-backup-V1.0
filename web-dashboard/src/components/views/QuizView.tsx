import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface QuizQuestion {
  id: number;
  question: string;
  targetMeaning: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

const quizData: QuizQuestion[] = [
  {
    id: 1,
    question: "Từ nào có nghĩa là \"sự đổi mới; cải tiến công nghệ\"?",
    targetMeaning: "sự đổi mới",
    options: [
      { key: 'A', text: 'persistent' },
      { key: 'B', text: 'innovation' },
      { key: 'C', text: 'fragile' },
      { key: 'D', text: 'obscure' }
    ],
    correctAnswer: 'B',
    explanation: 'Innovation (danh từ) nghĩa là sự đổi mới, sáng kiến hoặc cải tiến công nghệ.'
  },
  {
    id: 2,
    question: "Từ nào có nghĩa là \"kiên trì, bền bỉ, không bỏ cuộc\"?",
    targetMeaning: "kiên trì, bền bỉ",
    options: [
      { key: 'A', text: 'persistent' },
      { key: 'B', text: 'meticulous' },
      { key: 'C', text: 'serendipity' },
      { key: 'D', text: 'vocabulary' }
    ],
    correctAnswer: 'A',
    explanation: 'Persistent (tính từ) dùng để mô tả sự kiên trì, theo đuổi mục tiêu dù gặp trở ngại.'
  },
  {
    id: 3,
    question: "Từ nào có nghĩa là \"sự tình cờ phát hiện ra điều may mắn\"?",
    targetMeaning: "sự tình cờ may mắn",
    options: [
      { key: 'A', text: 'innovation' },
      { key: 'B', text: 'meticulous' },
      { key: 'C', text: 'serendipity' },
      { key: 'D', text: 'persistent' }
    ],
    correctAnswer: 'C',
    explanation: 'Serendipity (danh từ) có nghĩa là sự tình cờ may mắn trong cuộc sống.'
  }
];

export const QuizView: React.FC = () => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [_score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);

  const currentQ = quizData[currentQIndex];

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isAnswered]);

  const handleSelectOption = (key: string) => {
    if (isAnswered) return;
    setSelectedOption(key);
    setIsAnswered(true);
    if (key === currentQ.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < quizData.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(45);
    } else {
      setCurrentQIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(45);
    }
  };

  return (
    <div className="max-w-[820px] mx-auto flex flex-col gap-6 select-none font-sans animate-fade-in">
      {/* Quiz Header Bar */}
      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#4F46E5] dark:text-[#818CF8]" />
            <span className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Trắc Nghiệm Từ Vựng Oxford (Speed Quiz)</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="indigo" size="md">
              Câu {currentQIndex + 1} / 10
            </Badge>
            <Badge variant="amber" size="md">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#EEF2FF] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#4F46E5] dark:bg-[#818CF8] h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentQIndex + 1) / 10) * 100}%` }}
          />
        </div>
      </Card>

      {/* Main Question Card */}
      <Card className="p-6 md:p-8 flex flex-col gap-6">
        <div className="text-center">
          <Badge variant="indigo" size="sm" pill>
            Thử Thách Từ Vựng #0{currentQIndex + 1}
          </Badge>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mt-3 leading-snug tracking-tight">
            {currentQ.question}
          </h2>
        </div>

        {/* 4 Multiple Choice Options */}
        <div className="flex flex-col gap-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            const isCorrect = opt.key === currentQ.correctAnswer;
            
            let btnStyle = "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#EEF2FF] dark:hover:bg-[#4F46E5]/20";
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-400 text-emerald-950 dark:text-emerald-200 font-bold ring-2 ring-emerald-400/30";
              } else if (isSelected && !isCorrect) {
                btnStyle = "bg-rose-50 dark:bg-rose-500/20 border-rose-400 text-rose-950 dark:text-rose-200 font-bold";
              }
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                className={`w-full p-4 rounded-2xl border text-[15px] font-semibold flex items-center justify-between transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${btnStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-[13px] ${
                    isAnswered && isCorrect
                      ? 'bg-[#059669] text-white'
                      : isAnswered && isSelected && !isCorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#EEF2FF] dark:bg-[#4F46E5]/30 text-[#4F46E5] dark:text-[#818CF8]'
                  }`}>
                    {opt.key}
                  </span>
                  <span className="font-mono font-bold text-base">{opt.text}</span>
                </div>

                {isAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-[#059669] dark:text-[#34D399]" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Alert when Answered */}
        {isAnswered && (
          <div className="bg-[#EEF2FF] dark:bg-[#4F46E5]/15 border border-[#C7D2FE]/60 dark:border-[#4F46E5]/30 p-4 rounded-2xl text-[13.5px] text-[#0F172A] dark:text-[#E2E8F0] leading-relaxed">
            <span className="font-bold text-[#4F46E5] dark:text-[#818CF8] block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Giải thích đáp án Oxford:
            </span>
            {currentQ.explanation}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
          <Button variant="ghost" size="md" onClick={handleNextQuestion}>
            Bỏ qua câu này
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleNextQuestion}
            disabled={!isAnswered}
            rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.3]" />}
          >
            Câu tiếp theo
          </Button>
        </div>
      </Card>
    </div>
  );
};
