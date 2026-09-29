import React, { useState } from 'react';
import { Crown, Moon, Sun, Bell, Globe, RefreshCw, HelpCircle, Info, LogOut, ChevronRight, Check, Sparkles } from 'lucide-react';
import { mockUser } from '../../data';
import { Button, Card, Badge } from '../ui';

export const ProfileSettingsView: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(() => localStorage.getItem('lexiflow_auto_play_audio') === 'true');
  const [language, setLanguage] = useState('vi');

  const handleToggleAutoPlay = () => {
    const nextVal = !autoPlayAudio;
    setAutoPlayAudio(nextVal);
    localStorage.setItem('lexiflow_auto_play_audio', String(nextVal));
  };

  return (
    <div className="max-w-[840px] mx-auto flex flex-col gap-6 font-sans animate-fade-in pb-12">
      {/* User Header Profile Card */}
      <Card variant="default" className="p-6 flex items-center justify-between gap-4 border-[#E6ECF5]">
        <div className="flex items-center gap-4">
          <img
            src={mockUser.avatar}
            alt={mockUser.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-[#4F46E5]/20 shadow-craft"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{mockUser.name}</h2>
              <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            </div>
            <p className="text-[13px] text-[#64748B] font-mono">{mockUser.email}</p>
            <div className="mt-1.5">
              <Badge variant="indigo">
                Học Viên Oxford VIP · Level 8
              </Badge>
            </div>
          </div>
        </div>

        <Button variant="secondary" size="sm">
          Chỉnh sửa hồ sơ
        </Button>
      </Card>

      {/* Premium Upgrade Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 p-5 rounded-3xl shadow-craft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
            <Crown className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-amber-950 tracking-tight">Gói LexiFlow Oxford Pro</h3>
            <p className="text-[12.5px] text-amber-800 font-medium">Mở khóa thẻ ghi nhớ SM-2 không giới hạn, máy quét OCR AI Vision & audio IPA chuẩn.</p>
          </div>
        </div>

        <Button variant="primary" size="md" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/30 border-transparent">
          Nâng cấp Pro
        </Button>
      </div>

      {/* Settings Options List */}
      <Card variant="default" className="p-0 overflow-hidden divide-y divide-[#E6ECF5] border-[#E6ECF5]">
        {/* Dark Mode Toggle */}
        <div className="p-4.5 flex items-center justify-between hover:bg-[#F6F8FC] transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              {darkMode ? <Moon className="w-5 h-5 stroke-[2]" /> : <Sun className="w-5 h-5 stroke-[2]" />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-[#0F172A]">Chế độ giao diện (Dark Mode)</span>
              <span className="text-[12px] text-[#64748B]">Chuyển đổi giữa phong cách Oxford Slate Sáng và Tối</span>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${darkMode ? 'bg-[#4F46E5]' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Notifications Toggle */}
        <div className="p-4.5 flex items-center justify-between hover:bg-[#F6F8FC] transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <Bell className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-[#0F172A]">Thông báo nhắc nhở lặp lại SM-2</span>
              <span className="text-[12px] text-[#64748B]">Nhận thông báo tự động vào các khung giờ 09:00, 14:00, 20:00</span>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${notifications ? 'bg-[#059669]' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Auto-Play Audio Toggle */}
        <div className="p-4.5 flex items-center justify-between hover:bg-[#F6F8FC] transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-[#0F172A]">Tự động phát âm thanh khi lật thẻ</span>
              <span className="text-[12px] text-[#64748B]">Tự động phát âm IPA chuẩn ngay khi lật mặt sau thẻ ghi nhớ</span>
            </div>
          </div>
          <button
            onClick={handleToggleAutoPlay}
            className={`w-12 h-6 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${autoPlayAudio ? 'bg-[#4F46E5]' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${autoPlayAudio ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Language Selector */}
        <div className="p-4.5 flex items-center justify-between hover:bg-[#F6F8FC] transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <Globe className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-[#0F172A]">Ngôn ngữ hiển thị</span>
              <span className="text-[12px] text-[#64748B]">Tiếng Việt / English (UK-US)</span>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#F6F8FC] border border-[#E6ECF5] text-[#4F46E5] font-mono font-bold text-[12px] py-1.5 px-3 rounded-xl focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Cloud Sync Status */}
        <div className="p-4.5 flex items-center justify-between hover:bg-[#F6F8FC] transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <RefreshCw className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-[#0F172A]">Đồng bộ đám mây</span>
              <span className="text-[12px] text-[#059669] font-mono font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Đã tự động đồng bộ
              </span>
            </div>
          </div>
          <button className="text-[12px] font-bold text-[#4F46E5] hover:underline focus-visible:ring-2 focus-visible:ring-[#4F46E5] rounded-lg px-2 py-1">
            Đồng bộ ngay
          </button>
        </div>

        {/* Help & Support */}
        <div className="p-4.5 flex items-center justify-between hover:bg-[#F6F8FC] transition-colors cursor-pointer">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="font-bold text-[14px] text-[#0F172A]">Trung tâm Trợ giúp & Hướng dẫn</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
        </div>

        {/* App Info */}
        <div className="p-4.5 flex items-center justify-between hover:bg-[#F6F8FC] transition-colors cursor-pointer">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-[#64748B] flex items-center justify-center">
              <Info className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="font-bold text-[14px] text-[#0F172A]">Giới thiệu hệ thống LexiFlow Studio</span>
          </div>
          <span className="text-[12px] font-mono font-bold text-[#94A3B8]">v1.0.0</span>
        </div>
      </Card>

      {/* Logout Action Button */}
      <Button variant="danger" size="lg" leftIcon={<LogOut className="w-4 h-4 stroke-[2.2]" />} className="w-full">
        Đăng xuất tài khoản
      </Button>
    </div>
  );

};

