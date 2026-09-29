import React from 'react';
import { Bell, Flame, Layers, Clock, X, Check } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, onMarkRead }) => {
  if (!isOpen) return null;

  const notificationsList = [
    {
      id: 'n1',
      title: 'Lịch học 14:00 đang đến hạn',
      desc: 'Làm quiz 10 câu - Ôn tập chủ đề: Travel',
      time: '10 phút trước',
      icon: <Clock className="w-4 h-4 text-[#7C5CFA]" />,
      bg: 'bg-[#F3E8FF]'
    },
    {
      id: 'n2',
      title: 'Chúc mừng chuỗi học tập!',
      desc: 'Bạn đã hoàn thành 12 ngày học liên tiếp 🏆',
      time: '2 giờ trước',
      icon: <Flame className="w-4 h-4 text-[#F59E0B]" />,
      bg: 'bg-[#FFF7ED]'
    },
    {
      id: 'n3',
      title: '20 Thẻ ghi nhớ đang chờ bạn',
      desc: 'Thời gian ôn tập theo thuật toán SM-2 đã tới',
      time: 'Hôm nay',
      icon: <Layers className="w-4 h-4 text-[#1F6FEB]" />,
      bg: 'bg-[#EEF2FB]'
    }
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-2xs flex justify-end p-4 sm:pr-8 sm:pt-16 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-[#E8ECF5] shadow-2xl max-w-sm w-full h-fit overflow-hidden animate-pop-in flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#EEF2FB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1F6FEB]" />
            <span className="font-bold text-[16px] text-[#1A2340]">Thông báo học tập</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8C97B0] hover:bg-[#EEF2FB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-3 flex flex-col gap-2 max-h-[360px] overflow-y-auto">
          {notificationsList.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF2FB] hover:bg-[#EEF2FB] transition-colors flex items-start gap-3 cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg ${n.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                {n.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[13px] text-[#1A2340] leading-snug">{n.title}</span>
                <span className="text-[12px] text-[#6B7690] mt-0.5">{n.desc}</span>
                <span className="text-[10px] text-[#8C97B0] font-medium mt-1">{n.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#EEF2FB] flex items-center justify-between text-[12px]">
          <button
            onClick={() => {
              onMarkRead();
              onClose();
            }}
            className="font-bold text-[#1F6FEB] hover:underline flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            Đánh dấu đã đọc tất cả
          </button>
        </div>
      </div>
    </div>
  );
};
