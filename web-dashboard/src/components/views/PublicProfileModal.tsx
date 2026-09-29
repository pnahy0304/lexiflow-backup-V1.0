import React from 'react';
import { X, Lock, Flame, Award, CheckCircle2, UserPlus, UserCheck } from 'lucide-react';

export interface PublicUserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  userCode: string; // e.g. '#LEXI-8921'
  isPublicProfile: number; // 0: Friends only, 1: Public
  level: number;
  xp: number;
  streakDays: number;
  wordsLearnedToday: number;
  badges: string[];
  relationshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked';
}

interface PublicProfileModalProps {
  user: PublicUserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSendRequest?: (uid: string) => void;
  onAcceptRequest?: (uid: string) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSendRequest,
  onAcceptRequest
}) => {
  if (!isOpen || !user) return null;

  const isFriend = user.relationshipStatus === 'accepted';
  const canViewDetails = user.isPublicProfile === 1 || isFriend;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans text-[#0F172A]">
      <div className="bg-white rounded-3xl border border-[#E6ECF5] shadow-2xl w-full max-w-md overflow-hidden animate-pop-in relative">
        {/* Top Header Background Banner */}
        <div className="h-32 bg-gradient-to-r from-[#4F46E5] to-[#6366F1] relative p-4 flex justify-end">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Avatar & Identity Section */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center -mt-16">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-xl bg-white"
            />
            <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-[#0F172A] text-white text-[10px] font-mono font-bold border-2 border-white">
              Lv.{user.level}
            </span>
          </div>

          <h3 className="font-extrabold text-xl text-[#0F172A] mt-3 tracking-tight">
            {user.displayName}
          </h3>

          {/* User Public Unique Code (#LEXI-XXXX) */}
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 rounded-full bg-[#F1F5F9] text-[#4F46E5] text-[12px] font-mono font-bold tracking-wider">
              {user.userCode}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
              user.isPublicProfile === 1
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {user.isPublicProfile === 1 ? '🌐 Công khai' : '🔒 Chỉ bạn bè'}
            </span>
          </div>

          {/* Relationship Status & Action Button */}
          <div className="mt-4 w-full">
            {user.relationshipStatus === 'none' && onSendRequest && (
              <button
                onClick={() => onSendRequest(user.uid)}
                className="w-full py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[13.5px] shadow-indigo-glow transition-all flex items-center justify-center gap-2 clickable"
              >
                <UserPlus className="w-4 h-4" />
                <span>Gửi Lời Mời Kết Bạn</span>
              </button>
            )}

            {user.relationshipStatus === 'pending_sent' && (
              <div className="w-full py-2 rounded-2xl bg-slate-100 text-slate-600 font-bold text-[13px] flex items-center justify-center gap-2">
                <span>Đã Gửi Lời Mời (Chờ phản hồi)</span>
              </div>
            )}

            {user.relationshipStatus === 'pending_received' && onAcceptRequest && (
              <button
                onClick={() => onAcceptRequest(user.uid)}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13.5px] shadow-lg transition-all flex items-center justify-center gap-2 clickable"
              >
                <UserCheck className="w-4 h-4" />
                <span>Chấp Nhận Kết Bạn</span>
              </button>
            )}

            {isFriend && (
              <div className="w-full py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[13px] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bạn Bè Trên LexiFlow</span>
              </div>
            )}
          </div>

          {/* Privacy Locked Screen View */}
          {!canViewDetails ? (
            <div className="mt-6 p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] w-full flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[15px] text-[#0F172A]">Hồ sơ riêng tư</h4>
              <p className="text-[12.5px] text-[#64748B] text-center">
                Người dùng này đặt chế độ chỉ bạn bè mới được xem chi tiết tiến trình học tập, chuỗi streak và huy hiệu.
              </p>
            </div>
          ) : (
            /* Full Stats Grid (Accessible to Friends or Public profile) */
            <div className="mt-6 flex flex-col gap-4 w-full text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] flex flex-col">
                  <span className="text-[10.5px] font-mono font-bold text-[#94A3B8] uppercase">Chuỗi Streak</span>
                  <div className="flex items-center gap-1.5 mt-1 text-amber-600 font-extrabold text-lg">
                    <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                    <span>{user.streakDays} Ngày</span>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] flex flex-col">
                  <span className="text-[10.5px] font-mono font-bold text-[#94A3B8] uppercase">Tổng Điểm XP</span>
                  <span className="font-extrabold text-lg text-[#4F46E5] mt-1">
                    +{user.xp.toLocaleString('vi-VN')} XP
                  </span>
                </div>
              </div>

              {/* Today Learned Stats */}
              <div className="bg-[#EEF2FF] p-4 rounded-2xl border border-[#C7D2FE] flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#3730A3]">Đã học hôm nay</span>
                <span className="font-mono font-extrabold text-base text-[#4F46E5]">
                  {user.wordsLearnedToday} Từ Vựng
                </span>
              </div>

              {/* Badges Earned */}
              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-mono font-bold text-[#64748B] uppercase">Huy Hiệu Sở Hữu</span>
                <div className="flex flex-wrap gap-2">
                  {user.badges && user.badges.length > 0 ? (
                    user.badges.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[12px] font-bold"
                      >
                        <Award className="w-4 h-4 text-purple-600" />
                        <span>{b}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[12.5px] text-[#94A3B8] italic">Chưa có huy hiệu</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
