import React, { useState } from 'react';
import { X, Share2, Copy, Check, Download, Sparkles } from 'lucide-react';

export interface SharedDeckData {
  shareCode: string;
  shareUrl: string;
  title: string;
  description: string;
  ownerName: string;
  wordCount: number;
  sampleWords: Array<{ word: string; meaning: string; example?: string }>;
}

interface DeckShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: SharedDeckData | null;
  onImportDeck?: (shareCode: string) => void;
}

export const DeckShareModal: React.FC<DeckShareModalProps> = ({
  isOpen,
  onClose,
  deck,
  onImportDeck
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [imported, setImported] = useState(false);

  if (!isOpen || !deck) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deck.shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleImport = () => {
    if (onImportDeck) {
      onImportDeck(deck.shareCode);
    }
    setImported(true);
    setTimeout(() => {
      setImported(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans text-[#0F172A]">
      <div className="bg-white rounded-3xl border border-[#E6ECF5] shadow-2xl w-full max-w-lg overflow-hidden animate-pop-in relative">
        {/* Header */}
        <div className="p-6 bg-[#F8FAFC] border-b border-[#E6ECF5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4F46E5] text-white">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xl text-[#0F172A]">Chia Sẻ Bộ Thẻ Flashcard</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
          {/* Deck Info Box */}
          <div className="p-4 bg-[#EEF2FF] rounded-2xl border border-[#C7D2FE] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-[#4F46E5] text-white text-[11px] font-mono font-bold uppercase">
                {deck.shareCode}
              </span>
              <span className="text-[12px] font-mono text-[#4F46E5] font-semibold">{deck.wordCount} Từ vựng</span>
            </div>
            <h4 className="font-serif-craft font-bold text-lg text-[#0F172A]">{deck.title}</h4>
            <p className="text-[13px] text-[#475569]">{deck.description}</p>
            <span className="text-[11.5px] text-[#64748B] italic">Tạo bởi: {deck.ownerName}</span>
          </div>

          {/* Share Link & QR Preview */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-mono font-bold text-[#94A3B8] uppercase">Đường Link Chia Sẻ & Mã QR</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={deck.shareUrl}
                className="flex-1 px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-mono text-[13px] text-[#4F46E5] focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[13px] transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          {/* Sample Words List */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-mono font-bold text-[#94A3B8] uppercase">Xem Trước Từ Vựng Trong Bộ Thẻ</span>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {deck.sampleWords.map((w, idx) => (
                <div key={idx} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-[13px]">
                  <span className="font-bold text-[#0F172A]">{w.word}</span>
                  <span className="text-[#64748B]">{w.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Differential Sync Notice for Existing Owners */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col gap-1 text-[12.5px] text-amber-900">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Đồng bộ từ mới không mất tiến độ</span>
            </div>
            <p className="text-amber-800 text-[12px]">
              Nếu chủ deck thêm từ mới, hệ thống tự động lọc các từ đã có trong bộ nhớ của bạn để chỉ nhập từ mới mà KHÔNG đè đè tiến độ ôn tập SM-2 cũ.
            </p>
          </div>

          {/* Action Import Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleImport}
              disabled={imported}
              className={`w-full py-3.5 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-indigo-glow clickable ${
                imported
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0F172A] hover:bg-slate-800 text-white'
              }`}
            >
              {imported ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>Đã Đồng Bộ Từ Mới Thành Công!</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 text-[#4F46E5]" />
                  <span>Import / Cập Nhật Từ Mới (Giữ Nguyên SM-2)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
