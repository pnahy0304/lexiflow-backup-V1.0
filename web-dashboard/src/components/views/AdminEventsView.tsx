import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Users, 
  Award, 
  Edit3, 
  Trash2, 
  Sparkles, 
  X, 
  Flame,
  Megaphone
} from 'lucide-react';
import { Button, Card, Badge, Input } from '../ui';

export interface CommunityEvent {
  id: string;
  title: string;
  category: 'Marathon' | 'Challenge' | 'Sprint' | 'Community';
  description: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  targetWords: number;
  xpReward: number;
  badgeName: string;
  participantsCount: number;
  targetAudience: 'Tất cả học viên' | 'Thành viên PRO' | 'Người mới';
  status: 'active' | 'upcoming' | 'ended' | 'draft';
}

export const initialEvents: CommunityEvent[] = [
  {
    id: 'evt-1',
    title: 'Thách Đấu 50 Từ Vựng C2 Trong 7 Ngày',
    category: 'Marathon',
    description: 'Chinh phục 50 từ vựng tiếng Anh trình độ C2 Oxford cao cấp cùng thuật toán lặp lại ngắt quãng SM-2.',
    bannerUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    startDate: '2026-09-20',
    endDate: '2026-09-27',
    targetWords: 50,
    xpReward: 500,
    badgeName: 'Bậc Thầy C2 Oxford',
    participantsCount: 1420,
    targetAudience: 'Tất cả học viên',
    status: 'active'
  },
  {
    id: 'evt-2',
    title: 'Giải Đấu Trắc Nghiệm Tốc Độ LexiFlow 2026',
    category: 'Challenge',
    description: 'Thi đấu trả lời đúng 20 câu trắc nghiệm từ vựng trong thời gian ngắn nhất để dành top bảng xếp hạng tuần.',
    bannerUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    startDate: '2026-09-25',
    endDate: '2026-10-02',
    targetWords: 30,
    xpReward: 800,
    badgeName: 'Thần Tốc Từ Vựng',
    participantsCount: 890,
    targetAudience: 'Thành viên PRO',
    status: 'upcoming'
  },
  {
    id: 'evt-3',
    title: 'Ngày Hội Quét Chữ Camera OCR',
    category: 'Community',
    description: 'Tải ảnh và quét 10 trang sách hoặc tài liệu báo chí Anh-Mỹ bằng camera AI để nhận huy hiệu độc quyền.',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    startDate: '2026-09-10',
    endDate: '2026-09-18',
    targetWords: 25,
    xpReward: 350,
    badgeName: 'Thợ Săn Chữ OCR',
    participantsCount: 2150,
    targetAudience: 'Tất cả học viên',
    status: 'ended'
  },
  {
    id: 'evt-4',
    title: 'Chiến Dịch Ghi Nhớ 100 Từ Vựng Chuyên Nành IT & Data',
    category: 'Sprint',
    description: 'Chương trình học cấp tốc các thuật ngữ tiếng Anh công nghệ dành riêng cho lập trình viên và kỹ sư.',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    startDate: '2026-10-01',
    endDate: '2026-10-15',
    targetWords: 100,
    xpReward: 1200,
    badgeName: 'Tech Vocab Pro',
    participantsCount: 0,
    targetAudience: 'Tất cả học viên',
    status: 'draft'
  }
];

export const AdminEventsView: React.FC = () => {
  const [events, setEvents] = useState<CommunityEvent[]>(initialEvents);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'upcoming' | 'ended' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);

  // Broadcast Modal State
  const [broadcastEvent, setBroadcastEvent] = useState<CommunityEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<CommunityEvent, 'id' | 'participantsCount'>>({
    title: '',
    category: 'Marathon',
    description: '',
    bannerUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetWords: 40,
    xpReward: 500,
    badgeName: 'Chiến Binh LexiFlow',
    targetAudience: 'Tất cả học viên',
    status: 'active'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      category: 'Marathon',
      description: '',
      bannerUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targetWords: 40,
      xpReward: 500,
      badgeName: 'Chiến Binh LexiFlow',
      targetAudience: 'Tất cả học viên',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: CommunityEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      category: event.category,
      description: event.description,
      bannerUrl: event.bannerUrl,
      startDate: event.startDate,
      endDate: event.endDate,
      targetWords: event.targetWords,
      xpReward: event.xpReward,
      badgeName: event.badgeName,
      targetAudience: event.targetAudience,
      status: event.status
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === editingEvent.id
            ? { ...item, ...formData }
            : item
        )
      );
      showToast(`Đã cập nhật sự kiện "${formData.title}" thành công!`);
    } else {
      const newEvt: CommunityEvent = {
        id: `evt-${Date.now()}`,
        ...formData,
        participantsCount: 0
      };
      setEvents((prev) => [newEvt, ...prev]);
      showToast(`Đã tạo sự kiện mới "${formData.title}" thành công!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${title}" không?`)) {
      setEvents((prev) => prev.filter((item) => item.id !== id));
      showToast(`Đã xóa sự kiện "${title}" khỏi hệ thống.`);
    }
  };

  const handleTogglePublish = (id: string) => {
    setEvents((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === 'draft' ? 'active' : 'draft';
          showToast(
            newStatus === 'active'
              ? `Đã xuất bản sự kiện "${item.title}" lên cộng đồng học viên!`
              : `Đã chuyển sự kiện "${item.title}" về dạng Bản Nháp.`
          );
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const handleBroadcastPush = (event: CommunityEvent) => {
    setBroadcastEvent(event);
  };

  const confirmSendBroadcast = () => {
    if (broadcastEvent) {
      showToast(`📢 Đã phát thông báo về "${broadcastEvent.title}" đến toàn bộ 4,280 học viên!`);
      setBroadcastEvent(null);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesFilter = activeFilter === 'all' || evt.status === activeFilter;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalEvents = events.length;
  const activeCount = events.filter((e) => e.status === 'active').length;
  const totalParticipants = events.reduce((acc, curr) => acc + curr.participantsCount, 0);

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1500px] mx-auto animate-fade-in font-sans text-[#0F172A] pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-craft border border-white/10 flex items-center gap-3 animate-pop-in">
          <Sparkles className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-[13.5px] font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header Banner */}
      <Card variant="default" className="p-6 md:p-8 relative overflow-hidden border-[#E6ECF5]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#4F46E5]/10 via-[#6366F1]/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="indigo">Studio Admin Portal</Badge>
              <span className="flex items-center gap-1 text-[12px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live System
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Quản Lý Sự Kiện & Thách Đấu Cộng Đồng 🚀
            </h1>
            <p className="text-[#64748B] text-[14px] max-w-2xl">
              Tạo, xuất bản và điều hành các chương trình học tập từ vựng ngắt quãng SM-2, trắc nghiệm tốc độ và trao huy hiệu thưởng cho học viên.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-5 h-5 stroke-[2.5]" />}
            onClick={handleOpenCreateModal}
            className="shrink-0 shadow-indigo-glow"
          >
            Tạo Sự Kiện Mới
          </Button>
        </div>
      </Card>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card variant="default" className="p-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-mono font-bold text-[#64748B] uppercase tracking-wider">Tổng Sự Kiện</span>
            <span className="text-2xl font-extrabold text-[#0F172A] mt-1">{totalEvents}</span>
            <span className="text-[11px] text-[#4F46E5] font-medium mt-1">Hệ thống LexiFlow</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-mono font-bold text-[#64748B] uppercase tracking-wider">Đang Diễn Ra</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1">{activeCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium mt-1">Được học viên tham gia</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-mono font-bold text-[#64748B] uppercase tracking-wider">Lượt Tham Gia</span>
            <span className="text-2xl font-extrabold text-[#0F172A] mt-1">{totalParticipants.toLocaleString('vi-VN')}</span>
            <span className="text-[11px] text-amber-600 font-medium mt-1">Tỉ lệ tương tác 92%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-mono font-bold text-[#64748B] uppercase tracking-wider">Huy Hiệu Đã Trao</span>
            <span className="text-2xl font-extrabold text-[#0F172A] mt-1">1,420</span>
            <span className="text-[11px] text-[#4F46E5] font-medium mt-1">Học viên đạt mốc</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Filters & Search Controls */}
      <Card variant="default" className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'active', label: '🔴 Đang diễn ra' },
            { id: 'upcoming', label: '⚡ Sắp diễn ra' },
            { id: 'ended', label: '🏁 Đã kết thúc' },
            { id: 'draft', label: '📝 Bản nháp' }
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[#94A3B8]" />}
          />
        </div>
      </Card>

      {/* Events Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => {
          let statusBadge = (
            <Badge variant="emerald" dot>Đang diễn ra</Badge>
          );
          if (evt.status === 'upcoming') {
            statusBadge = (
              <Badge variant="indigo">Sắp diễn ra</Badge>
            );
          } else if (evt.status === 'ended') {
            statusBadge = (
              <Badge variant="slate">Đã kết thúc</Badge>
            );
          } else if (evt.status === 'draft') {
            statusBadge = (
              <Badge variant="amber">📝 Bản nháp</Badge>
            );
          }

          return (
            <Card
              key={evt.id}
              variant="interactive"
              className="flex flex-col overflow-hidden group border-[#E6ECF5] p-0"
            >
              {/* Banner Header Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={evt.bannerUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Top Status & Category Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-xl bg-white/20 text-white text-[11px] font-mono font-bold backdrop-blur-md border border-white/20 uppercase tracking-wider">
                    {evt.category}
                  </span>
                  {statusBadge}
                </div>

                {/* Title overlay on banner */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="font-serif font-bold text-xl text-white drop-shadow-xs line-clamp-1">
                    {evt.title}
                  </h3>
                  <div className="flex items-center gap-3 text-white/80 text-[12px] font-mono mt-1">
                    <span>📅 {evt.startDate} → {evt.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                <p className="text-[13.5px] text-[#475569] leading-relaxed line-clamp-2">
                  {evt.description}
                </p>

                {/* Key Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] font-mono text-[12px]">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-[#94A3B8] font-semibold text-[10px] uppercase">Mục Tiêu</span>
                    <span className="font-bold text-[#0F172A] text-[13px]">{evt.targetWords} Từ C1-C2</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center border-x border-[#E2E8F0]">
                    <span className="text-[#94A3B8] font-semibold text-[10px] uppercase">Phần Thưởng</span>
                    <span className="font-bold text-[#4F46E5] text-[13px]">+{evt.xpReward} XP</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-[#94A3B8] font-semibold text-[10px] uppercase">Học Viên</span>
                    <span className="font-bold text-[#0F172A] text-[13px]">{evt.participantsCount.toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                {/* Badge Reward Tag */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-[12.5px] font-medium">
                  <Award className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">Huy hiệu: <strong className="font-bold text-purple-700">{evt.badgeName}</strong></span>
                </div>

                {/* Admin Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F1F5F9]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(evt)}
                      className="p-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                      title="Chỉnh sửa sự kiện"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleBroadcastPush(evt)}
                      className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                      title="Phát thông báo tới học viên"
                    >
                      <Megaphone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                      title="Xóa sự kiện"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    variant={evt.status === 'draft' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleTogglePublish(evt.id)}
                  >
                    {evt.status === 'draft' ? '🚀 Xuất Bản Ngay' : '📝 Chuyển Thành Nháp'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card variant="default" className="text-center flex flex-col items-center justify-center gap-4 py-12 p-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-xl text-[#0F172A]">Không tìm thấy sự kiện nào</h3>
          <p className="text-[14px] text-[#64748B] max-w-md">
            Không có sự kiện nào khớp với bộ lọc hoặc từ khóa tìm kiếm. Hãy thử thay đổi từ khóa hoặc tạo sự kiện mới.
          </p>
          <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
            Tạo sự kiện ngay
          </Button>
        </Card>
      )}

      {/* CREATE & EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#E6ECF5] shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-pop-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#F8FAFC] border-b border-[#E6ECF5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#4F46E5] text-white">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#0F172A]">
                  {editingEvent ? 'Chỉnh Sửa Sự Kiện' : 'Tạo Sự Kiện Mới Cho Cộng Đồng'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-200 text-[#64748B] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEvent} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#0F172A]">Tên Sự Kiện / Thách Đấu *</label>
                <Input
                  type="text"
                  required
                  placeholder="Ví dụ: Thách Đấu 50 Từ Vựng C2 Trong 7 Ngày"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#0F172A]">Thể loại</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Marathon">Marathon Từ Vựng</option>
                    <option value="Challenge">Thách Đấu Tốc Độ</option>
                    <option value="Sprint">Chương Trình Cấp Tốc</option>
                    <option value="Community">Sự Kiện Cộng Đồng</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#0F172A]">Đối tượng tham gia</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Tất cả học viên">Tất cả học viên</option>
                    <option value="Thành viên PRO">Thành viên PRO</option>
                    <option value="Người mới">Học viên mới</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#0F172A]">Mô tả chi tiết nội dung sự kiện</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả mục tiêu, luật chơi và các quyền lợi học viên nhận được..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#0F172A]">URL Ảnh Banner Bìa</label>
                <Input
                  type="url"
                  required
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#0F172A]">Ngày bắt đầu</label>
                  <Input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#0F172A]">Ngày kết thúc</label>
                  <Input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#0F172A]">Số từ mục tiêu</label>
                  <Input
                    type="number"
                    min={5}
                    max={500}
                    value={formData.targetWords}
                    onChange={(e) => setFormData({ ...formData, targetWords: Number(e.target.value) })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#0F172A]">Điểm XP Thưởng</label>
                  <Input
                    type="number"
                    min={50}
                    max={5000}
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#0F172A]">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="active">Đang diễn ra</option>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="draft">Bản nháp</option>
                    <option value="ended">Đã kết thúc</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#0F172A]">Tên Huy Hiệu Danh Dự</label>
                <Input
                  type="text"
                  required
                  placeholder="Ví dụ: Bậc Thầy C2 Oxford"
                  value={formData.badgeName}
                  onChange={(e) => setFormData({ ...formData, badgeName: e.target.value })}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6ECF5] mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="shadow-indigo-glow"
                >
                  {editingEvent ? 'Lưu Cập Nhật' : 'Tạo Sự Kiện'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BROADCAST MODAL */}
      {broadcastEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#E6ECF5] shadow-2xl w-full max-w-md p-6 flex flex-col gap-5 animate-pop-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600">
                <Megaphone className="w-5 h-5" />
                <h3 className="font-bold text-lg text-[#0F172A]">Gửi Thông Báo Push Notification</h3>
              </div>
              <button onClick={() => setBroadcastEvent(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[13.5px] text-[#475569] leading-relaxed">
              Bạn sắp gửi thông báo đến <strong>toàn bộ 4,280 học viên</strong> trên ứng dụng về sự kiện:
            </p>

            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex flex-col gap-1">
              <span className="font-bold text-[14px] text-[#0F172A]">{broadcastEvent.title}</span>
              <span className="text-[12px] text-[#64748B]">Mục tiêu: {broadcastEvent.targetWords} từ · Phần thưởng: +{broadcastEvent.xpReward} XP</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setBroadcastEvent(null)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={confirmSendBroadcast}
              >
                Xác Nhận Gửi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
