import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Flame, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Copy, 
  Check, 
  UserMinus
} from 'lucide-react';
import { PublicProfileModal } from './PublicProfileModal';
import type { PublicUserProfile } from './PublicProfileModal';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const mockFriendsList: PublicUserProfile[] = [
  {
    uid: 'user-friend-1',
    email: 'hoangnam@gmail.com',
    displayName: 'Hoàng Nam',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    userCode: '#LEXI-8492',
    isPublicProfile: 1,
    level: 7,
    xp: 2850,
    streakDays: 15,
    wordsLearnedToday: 24,
    badges: ['Bậc Thầy C2 Oxford', 'Thần Tốc Từ Vựng'],
    relationshipStatus: 'accepted'
  },
  {
    uid: 'user-friend-2',
    email: 'minhhoa@gmail.com',
    displayName: 'Lê Minh Hoa',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    userCode: '#LEXI-3910',
    isPublicProfile: 0,
    level: 5,
    xp: 1420,
    streakDays: 8,
    wordsLearnedToday: 12,
    badges: ['Chiến Binh SM-2'],
    relationshipStatus: 'accepted'
  },
  {
    uid: 'user-friend-3',
    email: 'trungduc@gmail.com',
    displayName: 'Trần Trung Đức',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=250',
    userCode: '#LEXI-7721',
    isPublicProfile: 1,
    level: 10,
    xp: 5400,
    streakDays: 32,
    wordsLearnedToday: 40,
    badges: ['Huyền Thoại Streak', 'Bậc Thầy C2 Oxford', 'Top 1 Tuần'],
    relationshipStatus: 'accepted'
  }
];

export const mockPendingRequests: PublicUserProfile[] = [
  {
    uid: 'user-req-1',
    email: 'phuonganh@gmail.com',
    displayName: 'Vũ Phương Anh',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    userCode: '#LEXI-1092',
    isPublicProfile: 1,
    level: 4,
    xp: 980,
    streakDays: 5,
    wordsLearnedToday: 15,
    badges: ['Người Mới Năng Nổ'],
    relationshipStatus: 'pending_received'
  }
];

export const FriendsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'requests' | 'search'>('list');
  const [friends, setFriends] = useState<PublicUserProfile[]>(mockFriendsList);
  const [pendingRequests, setPendingRequests] = useState<PublicUserProfile[]>(mockPendingRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [selectedUser, setSelectedUser] = useState<PublicUserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUserCode = '#LEXI-9821';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyUserCode = () => {
    navigator.clipboard.writeText(currentUserCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Đã sao chép Mã ID công khai của bạn!');
  };

  const handleOpenProfile = (user: PublicUserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAcceptRequest = (uid: string) => {
    const target = pendingRequests.find((r) => r.uid === uid);
    if (target) {
      setPendingRequests((prev) => prev.filter((r) => r.uid !== uid));
      setFriends((prev) => [...prev, { ...target, relationshipStatus: 'accepted' }]);
      showToast(`Đã chấp nhận lời mời kết bạn của ${target.displayName}!`);
    }
  };

  const handleRejectRequest = (uid: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.uid !== uid));
    showToast('Đã từ chối lời mời kết bạn.');
  };

  const handleUnfriend = (uid: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${name}?`)) {
      setFriends((prev) => prev.filter((f) => f.uid !== uid));
      showToast(`Đã hủy kết bạn với ${name}.`);
    }
  };

  const handleSendRequestInSearch = () => {
    showToast(`Đã gửi lời mời kết bạn thành công!`);
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.userCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-fade-in font-sans text-[#0F172A] dark:text-[#F8FAFC] pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 animate-pop-in">
          <Sparkles className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-[13.5px] font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#4F46E5]/10 via-[#6366F1]/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="sm" pill>Social Network</Badge>
            <Badge variant="emerald" size="sm" pill>
              <ShieldCheck className="w-3.5 h-3.5" /> Privacy Guard Active
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Bạn Bè & Kết Nối Học Tập 👥
          </h1>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-[14px] max-w-xl">
            Kết bạn qua Mã ID công khai duy nhất, theo dõi tiến trình streak và thi đua XP cùng bạn bè.
          </p>
        </div>

        {/* Self User ID Share Box */}
        <div className="z-10 bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4 shrink-0 shadow-xs">
          <div className="flex flex-col">
            <span className="text-[10.5px] font-mono font-bold text-[#94A3B8] uppercase">Mã ID Công Khai Của Bạn</span>
            <span className="font-mono font-extrabold text-lg text-[#4F46E5] dark:text-[#818CF8] tracking-wider">{currentUserCode}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyUserCode} leftIcon={copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}>
            {copiedCode ? 'Đã chép' : 'Sao chép'}
          </Button>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button
            variant={activeTab === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('list')}
            leftIcon={<Users className="w-4 h-4" />}
          >
            Danh sách Bạn bè ({friends.length})
          </Button>

          <Button
            variant={activeTab === 'requests' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('requests')}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Lời mời ({pendingRequests.length})
          </Button>

          <Button
            variant={activeTab === 'search' ? 'gradient' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('search')}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Tìm Bạn Bè Mới
          </Button>
        </div>

        {activeTab === 'list' && (
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã #LEXI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-[13px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
        )}
      </Card>

      {/* TAB 1: FRIENDS LIST */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFriends.map((friend) => (
            <Card
              key={friend.uid}
              className="p-5 flex flex-col justify-between gap-4 group hover:border-[#818CF8]"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={friend.avatarUrl}
                    alt={friend.displayName}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[#E2E8F0] dark:ring-[#334155]"
                  />
                  <span
                    className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1E293B]"
                    title="Đang Online"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-extrabold text-[16px] text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {friend.displayName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="indigo" size="sm">{friend.userCode}</Badge>
                    <Badge variant="emerald" size="sm">🟢 Online</Badge>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-[#F8FAFC] dark:bg-[#1E293B]/60 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] font-mono text-[12px]">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{friend.streakDays} Ngày</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="font-bold text-[#4F46E5] dark:text-[#818CF8]">+{friend.xp.toLocaleString('vi-VN')} XP</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9] dark:border-[#334155]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenProfile(friend)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  className="flex-1"
                >
                  Xem Hồ Sơ
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnfriend(friend.uid, friend.displayName)}
                  className="text-rose-600 hover:bg-rose-50"
                  title="Hủy kết bạn"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: PENDING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pendingRequests.map((req) => (
            <Card
              key={req.uid}
              className="p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={req.avatarUrl}
                  alt={req.displayName}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#E2E8F0] shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <h3 className="font-extrabold text-[15.5px] text-[#0F172A] dark:text-[#F8FAFC] truncate">{req.displayName}</h3>
                  <span className="text-[11px] font-mono text-[#4F46E5] dark:text-[#818CF8] font-bold">{req.userCode} · Lv.{req.level}</span>
                  <span className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">Đã gửi lời mời cho bạn</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="primary" size="sm" onClick={() => handleAcceptRequest(req.uid)} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Nhận
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleRejectRequest(req.uid)} className="text-rose-600">
                  Từ chối
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: SEARCH & ADD FRIENDS */}
      {activeTab === 'search' && (
        <Card className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-extrabold text-xl text-[#0F172A] dark:text-[#F8FAFC]">Tìm Kiếm Người Dùng</h3>
            <p className="text-[13.5px] text-[#64748B] dark:text-[#94A3B8]">
              Nhập chính xác Mã ID công khai (ví dụ: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[#4F46E5] dark:text-[#818CF8] font-mono font-bold">#LEXI-8492</code>), Email hoặc Tên hiển thị.
            </p>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Nhập #LEXI-XXXX hoặc tên bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl text-[15px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
            />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <span className="text-[12px] font-mono font-bold text-[#94A3B8] uppercase">Gợi Ý Người Dùng Khả Dụng</span>
            
            <div className="p-4 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                  alt="Thanh Thảo"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                />
                <div className="flex flex-col">
                  <h4 className="font-extrabold text-[15px] text-[#0F172A] dark:text-[#F8FAFC]">Nguyễn Thanh Thảo</h4>
                  <span className="text-[11px] font-mono text-[#4F46E5] dark:text-[#818CF8] font-bold">#LEXI-4491 · Lv.6</span>
                </div>
              </div>

              <Button variant="primary" size="sm" onClick={handleSendRequestInSearch} leftIcon={<UserPlus className="w-4 h-4" />}>
                Kết Bạn
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* PUBLIC PROFILE MODAL DIALOG */}
      <PublicProfileModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendRequest={() => showToast('Đã gửi lời mời kết bạn!')}
        onAcceptRequest={(uid) => handleAcceptRequest(uid)}
      />
    </div>
  );
};
