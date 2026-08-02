import React, { useEffect, useState } from 'react';
import { UserSettings } from '../../types';
import { cn } from '../../lib/utils';
import { Moon, Sun, Type, MapPin } from 'lucide-react';

interface SettingsTabProps {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
}

const FONTS = [
  { id: 'font-sans', name: '기본 고딕 (Noto Sans)' },
  { id: 'font-serif', name: '기본 명조 (Noto Serif)' },
  { id: 'font-nanum-gothic', name: '나눔고딕' },
  { id: 'font-nanum-myeongjo', name: '나눔명조' },
  { id: 'font-handwriting', name: '손글씨 (고운돋움)' },
];

export function SettingsTab({ settings, updateSettings }: SettingsTabProps) {
  const [locationStr, setLocationStr] = useState(settings.location);
  
  // Debounce location save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationStr !== settings.location) {
        updateSettings({ location: locationStr });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [locationStr, settings.location, updateSettings]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-text-muted flex items-center gap-2 mb-4">
          <MapPin size={16} /> 상단 위치 표시
        </h3>
        <div className="bg-bg-panel p-6 rounded-2xl border border-border shadow-sm">
          <label className="block text-sm mb-2 text-text-muted">어디에서 일기를 쓰고 계신가요?</label>
          <input 
            type="text"
            value={locationStr}
            onChange={(e) => setLocationStr(e.target.value)}
            placeholder="Seoul, South Korea"
            className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-text-base focus:outline-none focus:border-brand transition-colors"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-text-muted flex items-center gap-2 mb-4">
          <Type size={16} /> 폰트 설정
        </h3>
        <div className="bg-bg-panel p-6 rounded-2xl border border-border shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FONTS.map(font => (
              <button
                key={font.id}
                onClick={() => updateSettings({ font: font.id })}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  settings.font === font.id 
                    ? "border-brand bg-brand text-bg-panel font-medium" 
                    : "border-border hover:border-text-muted text-text-base hover:bg-bg-base"
                )}
                style={{ fontFamily: `var(--${font.id})` }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-text-muted flex items-center gap-2 mb-4">
          {settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} 
          화면 테마
        </h3>
        <div className="bg-bg-panel p-6 rounded-2xl border border-border shadow-sm flex gap-3">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={cn(
              "flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2",
              settings.theme === 'light' 
                ? "border-brand bg-brand text-bg-panel font-medium" 
                : "border-border hover:border-text-muted text-text-base hover:bg-bg-base"
            )}
          >
            <Sun size={18} /> 라이트 모드
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={cn(
              "flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2",
              settings.theme === 'dark' 
                ? "border-brand bg-brand text-bg-panel font-medium" 
                : "border-border hover:border-text-muted text-text-base hover:bg-bg-base"
            )}
          >
            <Moon size={18} /> 다크 모드
          </button>
        </div>
      </section>

    </div>
  );
}
