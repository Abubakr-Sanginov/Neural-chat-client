import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Default schedule: dark mode from 6 PM to 7 AM
const DEFAULT_SCHEDULE = {
  darkStart: '18:00',
  darkEnd: '07:00',
  enabled: true
};

export const useAutoDarkMode = (manualTheme, setManualTheme) => {
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('autoDarkSchedule');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
  });

  useEffect(() => {
    if (!schedule.enabled) return;

    const checkTime = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const [darkStartH, darkStartM] = schedule.darkStart.split(':').map(Number);
      const [darkEndH, darkEndM] = schedule.darkEnd.split(':').map(Number);
      const [currentH, currentM] = currentTime.split(':').map(Number);
      
      const currentMinutes = currentH * 60 + currentM;
      const darkStartMinutes = darkStartH * 60 + darkStartM;
      const darkEndMinutes = darkEndH * 60 + darkEndM;
      
      let shouldBeDark;
      if (darkStartMinutes > darkEndMinutes) {
        // Crosses midnight (e.g., 18:00 to 07:00)
        shouldBeDark = currentMinutes >= darkStartMinutes || currentMinutes < darkEndMinutes;
      } else {
        // Same day (e.g., 09:00 to 17:00)
        shouldBeDark = currentMinutes >= darkStartMinutes && currentMinutes < darkEndMinutes;
      }
      
      const newTheme = shouldBeDark ? 'dark' : 'light';
      if (newTheme !== manualTheme) {
        setManualTheme(newTheme);
      }
    };

    // Check immediately
    checkTime();
    
    // Check every minute
    const interval = setInterval(checkTime, 60000);
    
    return () => clearInterval(interval);
  }, [schedule, manualTheme, setManualTheme]);

  const updateSchedule = (newSchedule) => {
    setSchedule(newSchedule);
    localStorage.setItem('autoDarkSchedule', JSON.stringify(newSchedule));
  };

  return { schedule, updateSchedule };
};

export function AutoDarkModeSettings({ schedule, onUpdate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-300">Auto Dark Mode</label>
        <button
          onClick={() => onUpdate({ ...schedule, enabled: !schedule.enabled })}
          className={`px-3 py-1 rounded-lg text-sm ${
            schedule.enabled ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          {schedule.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {schedule.enabled && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <Moon size={14} />
              Dark starts at
            </label>
            <input
              type="time"
              value={schedule.darkStart}
              onChange={(e) => onUpdate({ ...schedule, darkStart: e.target.value })}
              className="w-full bg-[#1A232E] border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <Sun size={14} />
              Light starts at
            </label>
            <input
              type="time"
              value={schedule.darkEnd}
              onChange={(e) => onUpdate({ ...schedule, darkEnd: e.target.value })}
              className="w-full bg-[#1A232E] border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Theme will automatically switch based on the time of day
      </p>
    </div>
  );
}
