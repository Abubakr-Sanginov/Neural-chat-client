import { Sliders } from "lucide-react";
import { useState } from "react";

const ModelSettings = ({ onSave, initialSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(initialSettings || {
    temperature: 1.0,
    topP: 0.95,
    topK: 64,
  });

  const handleSave = () => {
    onSave(settings);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1A232E] hover:bg-[#2A3441] px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
        title="Model settings"
      >
        <Sliders size={18} />
        Parameters
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 bg-[#0F1419] border border-gray-700 rounded-lg shadow-xl z-[110] p-4 min-w-[280px]">
            <h3 className="text-sm font-semibold mb-3">Model Parameters</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 flex justify-between">
                  <span>Temperature</span>
                  <span>{settings.temperature}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) =>
                    setSettings({ ...settings, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 flex justify-between">
                  <span>Top P</span>
                  <span>{settings.topP}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.topP}
                  onChange={(e) =>
                    setSettings({ ...settings, topP: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 flex justify-between">
                  <span>Top K</span>
                  <span>{settings.topK}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={settings.topK}
                  onChange={(e) =>
                    setSettings({ ...settings, topK: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm transition-colors"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSettings;
