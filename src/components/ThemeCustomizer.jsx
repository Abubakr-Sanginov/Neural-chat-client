import { useState, useEffect } from 'react';
import { X, Palette, Save } from 'lucide-react';

const DEFAULT_THEMES = [
  { name: 'Dark Blue', colors: { primary: '#3B82F6', secondary: '#1E40AF', bg: '#0F1419', text: '#FFFFFF' } },
  { name: 'Purple Dream', colors: { primary: '#A855F7', secondary: '#7C3AED', bg: '#1A1625', text: '#FFFFFF' } },
  { name: 'Green Matrix', colors: { primary: '#10B981', secondary: '#059669', bg: '#0D1B11', text: '#FFFFFF' } },
  { name: 'Orange Sunset', colors: { primary: '#F97316', secondary: '#EA580C', bg: '#1A1206', text: '#FFFFFF' } },
  { name: 'Pink Passion', colors: { primary: '#EC4899', secondary: '#DB2777', bg: '#1A0C15', text: '#FFFFFF' } },
  // Light themes
  { name: 'Light Classic', colors: { primary: '#3B82F6', secondary: '#2563EB', bg: '#FFFFFF', text: '#1F2937' } },
  { name: 'Light Gray', colors: { primary: '#6366F1', secondary: '#4F46E5', bg: '#F3F4F6', text: '#111827' } },
  { name: 'Light Warm', colors: { primary: '#F59E0B', secondary: '#D97706', bg: '#FFFBEB', text: '#1C1917' } },
];

export default function ThemeCustomizer({ isOpen, onClose }) {
  const [customTheme, setCustomTheme] = useState({
    name: 'Custom Theme',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      bg: '#0F1419',
      text: '#FFFFFF'
    }
  });

  const [savedCustomThemes, setSavedCustomThemes] = useState(() => {
    const saved = localStorage.getItem('customThemes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (isOpen) {
      const root = document.documentElement;
      const currentPrimary = getComputedStyle(root).getPropertyValue('--color-primary').trim();
      if (currentPrimary) {
        setCustomTheme(prev => ({
          ...prev,
          colors: { ...prev.colors, primary: currentPrimary }
        }));
      }
    }
  }, [isOpen]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-bg', theme.colors.bg);
    root.style.setProperty('--color-text', theme.colors.text);
    
    // Update body background for immediate visual feedback
    document.body.style.backgroundColor = theme.colors.bg;
    
    // Inject or update global theme override styles
    let styleEl = document.getElementById('theme-customizer-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-customizer-styles';
      document.head.appendChild(styleEl);
    }
    
    // Override common Tailwind colors with theme colors
    styleEl.textContent = `
      /* Theme Customizer Global Overrides */
      .bg-blue-600, .bg-blue-500, .bg-blue-700,
      .hover\\:bg-blue-600:hover, .hover\\:bg-blue-700:hover {
        background-color: ${theme.colors.primary} !important;
      }
      
      .text-blue-400, .text-blue-500 {
        color: ${theme.colors.primary} !important;
      }
      
      .border-blue-500, .border-blue-600 {
        border-color: ${theme.colors.primary} !important;
      }
      
      .from-blue-600, .to-blue-600 {
        --tw-gradient-from: ${theme.colors.primary} !important;
        --tw-gradient-to: ${theme.colors.primary} !important;
      }
      
      /* Background overrides */
      body, .bg-\\[\\#0F1419\\], .bg-\\[\\#1A232E\\] {
        background-color: ${theme.colors.bg} !important;
      }
      
      /* Sidebar background */
      aside {
        background-color: ${theme.colors.bg} !important;
      }
      
      /* Text colors */
      .text-white, .text-gray-100 {
        color: ${theme.colors.text} !important;
      }
      
      /* Button primary colors */
      button.bg-blue-600, button.bg-blue-500 {
        background-color: ${theme.colors.primary} !important;
      }
      
      button.bg-blue-600:hover, button.bg-blue-500:hover {
        background-color: ${theme.colors.secondary} !important;
      }
    `;
    
    // Save theme to localStorage for persistence
    localStorage.setItem('currentTheme', JSON.stringify(theme));
    
    // Show visual feedback
    const toast = document.createElement('div');
    toast.textContent = `✓ Theme "${theme.name}" applied!`;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${theme.colors.primary};
      color: ${theme.colors.text};
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };
  
  // Auto-load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('currentTheme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        // Apply theme without toast notification on page load
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-secondary', theme.colors.secondary);
        root.style.setProperty('--color-bg', theme.colors.bg);
        root.style.setProperty('--color-text', theme.colors.text);
        document.body.style.backgroundColor = theme.colors.bg;
        
        // Inject styles
        let styleEl = document.getElementById('theme-customizer-styles');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'theme-customizer-styles';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = `
          .bg-blue-600, .bg-blue-500, .bg-blue-700,
          .hover\\:bg-blue-600:hover, .hover\\:bg-blue-700:hover {
            background-color: ${theme.colors.primary} !important;
          }
          .text-blue-400, .text-blue-500 {
            color: ${theme.colors.primary} !important;
          }
          .border-blue-500, .border-blue-600 {
            border-color: ${theme.colors.primary} !important;
          }
          body, .bg-\\[\\#0F1419\\], .bg-\\[\\#1A232E\\] {
            background-color: ${theme.colors.bg} !important;
          }
          aside {
            background-color: ${theme.colors.bg} !important;
          }
          button.bg-blue-600, button.bg-blue-500 {
            background-color: ${theme.colors.primary} !important;
          }
        `;
      } catch (e) {
        console.error('Failed to load saved theme:', e);
      }
    }
  }, []);

  const saveCustomTheme = () => {
    const newThemes = [...savedCustomThemes, { ...customTheme, id: Date.now() }];
    setSavedCustomThemes(newThemes);
    localStorage.setItem('customThemes', JSON.stringify(newThemes));
    applyTheme(customTheme);
    
    alert('✓ Custom theme saved successfully!');
  };

  const deleteCustomTheme = (id) => {
    const newThemes = savedCustomThemes.filter(t => t.id !== id);
    setSavedCustomThemes(newThemes);
    localStorage.setItem('customThemes', JSON.stringify(newThemes));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A232E] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Palette size={24} className="text-blue-400" />
            <h2 className="text-xl font-bold">Theme Customizer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Default Themes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Preset Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DEFAULT_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className="p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-all group"
                >
                  <div className="flex gap-2 mb-2">
                    {Object.entries(theme.colors).map(([key, color]) => (
                      <div
                        key={key}
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Theme Creator */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Create Custom Theme</h3>
            <div className="bg-white/5 p-4 rounded-lg space-y-4">
              <div>
                <input
                  type="text"
                  value={customTheme.name}
                  onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
                  className="w-full bg-[#1A232E] px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="Theme Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(customTheme.colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm mb-2 capitalize">{key} Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => setCustomTheme({
                          ...customTheme,
                          colors: { ...customTheme.colors, [key]: e.target.value }
                        })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setCustomTheme({
                          ...customTheme,
                          colors: { ...customTheme.colors, [key]: e.target.value }
                        })}
                        className="flex-1 bg-[#1A232E] px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => applyTheme(customTheme)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                >
                  Preview
                </button>
                <button
                  onClick={saveCustomTheme}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Theme
                </button>
              </div>
            </div>
          </div>

          {/* Saved Custom Themes */}
          {savedCustomThemes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Your Custom Themes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {savedCustomThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-all group relative"
                  >
                    <button
                      onClick={() => applyTheme(theme)}
                      className="w-full text-left"
                    >
                      <div className="flex gap-2 mb-2">
                        {Object.entries(theme.colors).map(([key, color]) => (
                          <div
                            key={key}
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium">{theme.name}</p>
                    </button>
                    <button
                      onClick={() => deleteCustomTheme(theme.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
