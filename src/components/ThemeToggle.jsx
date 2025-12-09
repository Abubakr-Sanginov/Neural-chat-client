import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

const ThemeToggle = ({ theme, onToggle }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  // Apply system theme when in auto mode
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = () => {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      };
      
      applySystemTheme();
      mediaQuery.addEventListener('change', applySystemTheme);
      return () => mediaQuery.removeEventListener('change', applySystemTheme);
    }
  }, [theme]);

  const getIcon = () => {
    switch(theme) {
      case 'light': return <Sun size={18} />;
      case 'dark': return <Moon size={18} />;
      case 'auto': return <Monitor size={18} />;
      default: return <Moon size={18} />;
    }
  };

  const themes = [
    { value: 'light', label: 'Светлая', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Тёмная', icon: <Moon size={16} /> },
    { value: 'auto', label: 'Авто', icon: <Monitor size={16} /> },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all duration-200 group"
        title={`Theme: ${theme}`}
      >
        <div className="text-cyan-400 group-hover:text-white transition-colors">
          {getIcon()}
        </div>
        <span className="font-medium group-hover:text-white text-sm">
          {theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Авто'}
        </span>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 bg-[#0F1419] border border-gray-700 rounded-lg shadow-xl z-[110] min-w-[140px] overflow-hidden">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  onToggle(t.value);
                  setShowMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  theme === t.value 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-[#1A232E] text-gray-300'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
