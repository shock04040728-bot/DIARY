import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useFirebase } from './hooks/useFirebase';
import { Tab } from './types';
import { cn } from './lib/utils';
import { Loader2, Settings } from 'lucide-react';

import { DiaryTab } from './components/tabs/DiaryTab';
import { TimetableTab } from './components/tabs/TimetableTab';
import { TodosTab } from './components/tabs/TodosTab';
import { GoalsTab } from './components/tabs/GoalsTab';
import { BucketListTab } from './components/tabs/BucketListTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { Widgets } from './components/Widgets';

const TABS: { id: Tab; label: string }[] = [
  { id: 'diary', label: '일기' },
  { id: 'timetable', label: '시간표' },
  { id: 'todos', label: '할 일 목록' },
  { id: 'goals', label: '올해의 목표' },
  { id: 'bucketList', label: '버킷리스트' },
];

export default function App() {
  const { user, loading, error, settings, updateSettings, diaries, timetables, todos, goals, bucketList } = useFirebase();
  const [activeTab, setActiveTab] = useState<Tab>('diary');
  
  // A simple state to trigger the NEW modal in DiaryTab
  const [triggerNewPost, setTriggerNewPost] = useState(0);

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply font to body
    document.body.style.fontFamily = `var(--${settings.font})`;
  }, [settings.theme, settings.font]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e]"><Loader2 className="animate-spin text-white" /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#1e1e1e]">
        <div className="bg-bg-panel p-8 rounded-3xl border border-border shadow-sm max-w-md">
          <div className="text-red-500 mb-4 flex justify-center"><Loader2 className="animate-spin" /></div>
          <h2 className="text-xl font-bold text-text-base mb-2">인증 오류</h2>
          <p className="text-sm text-text-muted mb-6">
            Firebase에서 '익명 로그인'이 비활성화되어 있습니다. 앱을 실행하려면 Firebase 콘솔에서 설정을 켜주세요.
          </p>
          <div className="text-xs bg-bg-base p-4 rounded-xl text-left font-mono break-all text-text-muted">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const todayStr = format(currentDate, 'yyyy년 M월 d일 EEEE', { locale: ko });

  return (
    <div className="min-h-screen bg-[#e8e4d9] dark:bg-[#141413] p-4 sm:p-8 flex items-center justify-center font-sans transition-colors duration-300">
      <div className="w-full max-w-[1100px] bg-bg-panel rounded-[2rem] shadow-2xl overflow-hidden min-h-[85vh] flex flex-col">
        
        {/* Header Section */}
        <header className="px-8 sm:px-12 pt-12 pb-2 flex flex-col relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-[44px] md:text-[54px] font-extrabold tracking-tight text-brand mb-2" style={{ fontFamily: 'var(--font-serif)' }}>DIARY</h1>
              <div className="text-[12px] text-text-muted flex items-center gap-3">
                <span>{todayStr}</span>
                <span className="text-border">|</span>
                <span>{settings.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button 
                onClick={() => {
                  if (activeTab !== 'diary') setActiveTab('diary');
                  // Use setTimeout to ensure tab switch happens before setting trigger
                  setTimeout(() => setTriggerNewPost(prev => prev + 1), 0);
                }}
                className="bg-brand text-bg-panel text-[11px] font-bold px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors shadow-sm tracking-wider"
              >
                NEW
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-2 border border-border rounded-full hover:bg-bg-base text-text-muted transition-colors flex items-center justify-center"
              >
                <Settings size={15} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-8 overflow-x-auto border-b border-border">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "text-[13px] font-medium transition-colors whitespace-nowrap pb-4 relative",
                  activeTab === tab.id 
                    ? "text-text-base" 
                    : "text-text-muted hover:text-text-base"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-text-base" />
                )}
              </button>
            ))}
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex px-8 sm:px-12 py-8 transition-all duration-300 ease-in-out relative bg-bg-panel">
          {activeTab === 'diary' && (
            <div className="flex flex-col lg:flex-row gap-10 w-full">
              <div className="flex-1 min-w-0 pt-2">
                <DiaryTab diaries={diaries} triggerNewPost={triggerNewPost} />
              </div>
              <div className="w-full lg:w-[320px] flex-shrink-0 bg-bg-base/60 rounded-[1.5rem] p-6 lg:mr-0 lg:-mt-4">
                <Widgets timetables={timetables} todos={todos} goals={goals} bucketList={bucketList} />
              </div>
            </div>
          )}
          
          {activeTab === 'timetable' && <div className="w-full"><TimetableTab timetables={timetables} /></div>}
          {activeTab === 'todos' && <div className="w-full"><TodosTab todos={todos} /></div>}
          {activeTab === 'goals' && <div className="w-full"><GoalsTab goals={goals} /></div>}
          {activeTab === 'bucketList' && <div className="w-full"><BucketListTab items={bucketList} /></div>}
          {activeTab === 'settings' && <div className="w-full"><SettingsTab settings={settings} updateSettings={updateSettings} /></div>}
        </main>
      </div>
    </div>
  );
}
