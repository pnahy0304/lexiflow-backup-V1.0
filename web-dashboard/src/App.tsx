import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Greeting } from './components/Greeting';
import { HeroSearch } from './components/HeroSearch';
import { FeatureCards } from './components/FeatureCards';
import { RecentWords } from './components/RecentWords';
import { WordOfTheDay } from './components/WordOfTheDay';
import { LearningJourney } from './components/LearningJourney';
import { TodaySchedule } from './components/TodaySchedule';
import { MemoryStats } from './components/MemoryStats';
import { RecentActivity } from './components/RecentActivity';
import { SearchModal } from './components/SearchModal';
import { NotificationModal } from './components/NotificationModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';

// Feature Views
import { DictionaryView } from './components/views/DictionaryView';
import { FlashcardView } from './components/views/FlashcardView';
import { OcrView } from './components/views/OcrView';
import { QuizView } from './components/views/QuizView';
import { StatsView } from './components/views/StatsView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';
import { AdminEventsView } from './components/views/AdminEventsView';
import { FriendsView } from './components/views/FriendsView';
import { GroupsLeaderboardView } from './components/views/GroupsLeaderboardView';
import { CommunityEventsWidget } from './components/CommunityEventsWidget';

import { mockUser } from './data';
import { Menu, X, ArrowLeft } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type: 'success', title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dictionary':
      case 'oxford':
        return <DictionaryView />;
      case 'flashcards':
      case 'sm2':
        return <FlashcardView />;
      case 'ocr':
        return <OcrView />;
      case 'quiz':
        return <QuizView />;
      case 'stats':
        return <StatsView />;
      case 'friends':
        return <FriendsView />;
      case 'groups':
      case 'group-leaderboard':
        return <GroupsLeaderboardView />;
      case 'admin-events':
      case 'events':
        return <AdminEventsView />;
      case 'profile':
      case 'settings':
        return <ProfileSettingsView />;
      case 'home':
      default:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Center Main Column (XL: 8 cols) */}
            <div className="xl:col-span-8 flex flex-col gap-8 min-w-0">
              {/* Greeting */}
              <Greeting user={mockUser} />

              {/* Hero Search Banner */}
              <HeroSearch />

              {/* Community Events & Challenges Banner Widget */}
              <CommunityEventsWidget onSelectEvent={() => setActiveTab('admin-events')} />

              {/* Feature Cards Grid (4 Cards) */}
              <FeatureCards onSelectFeature={(id) => setActiveTab(id)} />

              {/* Bottom Row: Recent Words (Table) + Word of the Day (Card) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-7 flex flex-col">
                  <RecentWords />
                </div>
                <div className="md:col-span-5 flex flex-col">
                  <WordOfTheDay />
                </div>
              </div>
            </div>

            {/* Right Column: Widgets Stack (XL: 4 cols ~355px) */}
            <div className="xl:col-span-4 flex flex-col gap-6 w-full">
              {/* Learning Journey / Profile Card */}
              <LearningJourney />

              {/* Today's Schedule Card */}
              <TodaySchedule />

              {/* Memory Statistics Card */}
              <MemoryStats />

              {/* Recent Activity Feed Card */}
              <RecentActivity />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] flex flex-col md:flex-row font-sans text-[#1A2340]">
      {/* Toast Notification Floating System */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Global Interactive Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectResult={(tabId, word) => {
          setActiveTab(tabId);
          if (word) {
            addToast('Đã mở từ vựng', `Đang xem thông tin chi tiết của từ "${word}"`);
          }
        }}
      />

      {/* Notifications Drawer Modal */}
      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        onMarkRead={() => {
          setHasUnreadNotifications(false);
          addToast('Thông báo', 'Đã đánh dấu tất cả thông báo là đã đọc');
        }}
      />

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden animate-fade-in"
        />
      )}

      {/* Desktop Sidebar (Fixed left ~235px) */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }} />
      </div>

      {/* Main Container Right of Sidebar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Top Header Toggle Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#EEF2FB] border-b border-[#E8ECF5]">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl bg-white text-[#1F6FEB] shadow-2xs"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-lg text-[#1A2340]">LexiFlow</span>
          <img
            src={mockUser.avatar}
            alt={mockUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#1F6FEB]/30"
          />
        </div>

        {/* Topbar sticky Header */}
        <Topbar
          user={mockUser}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenNotifications={() => setNotificationModalOpen(true)}
          hasUnread={hasUnreadNotifications}
          onProfileClick={() => setActiveTab('profile')}
        />

        {/* Sub-view Navigation Back Bar if not on Home */}
        {activeTab !== 'home' && (
          <div className="px-8 pt-4 pb-0 flex items-center gap-3 animate-fade-in">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-[#EEF2FB] border border-[#E8ECF5] rounded-xl text-[13px] font-bold text-[#1F6FEB] transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Trang chủ</span>
            </button>
          </div>
        )}

        {/* Workspace Body */}
        <main key={activeTab} className="p-6 md:p-8 flex-1 max-w-[1600px] w-full mx-auto animate-fade-in">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
