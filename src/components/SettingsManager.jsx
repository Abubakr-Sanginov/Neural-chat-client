import { Download, Upload, X, Save, MessageSquare, Sliders, Settings, HardDrive } from 'lucide-react';
import ModelSettings from './ModelSettings';
import { useState, useEffect } from 'react';

export default function SettingsManager({ 
  systemInstruction,
  onSystemInstructionChange,
  modelSettings,
  onModelSettingsChange,
  onClose,
  fontSize,
  onFontSizeChange
}) {
  // Local state for buffering changes
  const [localSystemInstruction, setLocalSystemInstruction] = useState(systemInstruction);
  const [localModelSettings, setLocalModelSettings] = useState(modelSettings);
  const [localFontSize, setLocalFontSize] = useState(fontSize || 'normal');

  // Sync local state with props when they change (e.g. on open)
  useEffect(() => {
    setLocalSystemInstruction(systemInstruction);
    setLocalModelSettings(modelSettings);
    setLocalFontSize(fontSize);
  }, [systemInstruction, modelSettings, fontSize]);

  const handleSave = () => {
    onSystemInstructionChange(localSystemInstruction);
    onModelSettingsChange(localModelSettings);
    onFontSizeChange(localFontSize);
    onClose();
  };
  
  const handleExport = () => {
    const settingsData = {
      modelSettings: localModelSettings,
      systemInstruction: localSystemInstruction,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-chat-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        if (imported.version && imported.modelSettings) {
          if (imported.systemInstruction !== undefined) {
            setLocalSystemInstruction(imported.systemInstruction);
          }
          if (imported.modelSettings) {
            setLocalModelSettings(imported.modelSettings);
          }
          alert('Настройки загружены! Нажмите "Save & Close" для применения.');
        } else {
          alert('Неверный формат файла настроек');
        }
      } catch (error) {
        alert('Ошибка при чтении файла: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[900]"
        onClick={onClose}
      />
      
      {/* Settings Modal */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
        <div className="bg-[#0F1419] border border-gray-700 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col pointer-events-auto animate-scale-in mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Settings className="text-blue-500" size={24} />
              <h2 className="text-xl font-bold text-white">Настройки</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* System Instruction / Prompt */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                <MessageSquare size={18} className="text-blue-400" />
                Системный промпт
              </label>
              <textarea
                value={localSystemInstruction}
                onChange={(e) => setLocalSystemInstruction(e.target.value)}
                placeholder="Например: Ты полезный ассистент по программированию..."
                className="w-full bg-[#1A232E] border border-gray-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-2">
                Системный промпт определяет поведение и стиль AI
              </p>
            </div>

            {/* Model Settings */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <Sliders size={18} className="text-green-400" />
                Параметры модели
              </label>
              
              {/* Temperature */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 flex justify-between mb-1">
                  <span>Temperature</span>
                  <span className="text-white font-mono">{localModelSettings.temperature}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localModelSettings.temperature}
                  onChange={(e) =>
                    setLocalModelSettings({ ...localModelSettings, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">Контролирует случайность ответов</p>
              </div>

              {/* Top P */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 flex justify-between mb-1">
                  <span>Top P</span>
                  <span className="text-white font-mono">{localModelSettings.topP}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localModelSettings.topP}
                  onChange={(e) =>
                    setLocalModelSettings({ ...localModelSettings, topP: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">Накопительная вероятность токенов</p>
              </div>

              {/* Top K */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 flex justify-between mb-1">
                  <span>Top K</span>
                  <span className="text-white font-mono">{localModelSettings.topK}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={localModelSettings.topK}
                  onChange={(e) =>
                    setLocalModelSettings({ ...localModelSettings, topK: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">Количество рассматриваемых токенов</p>
              </div>

               {/* Font Size */}
               <div className="mb-4 pt-4 border-t border-gray-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                  <Sliders size={18} className="text-yellow-400" />
                  Размер шрифта
                </label>
                <div className="flex gap-2 bg-[#0F1419] p-1 rounded-lg border border-gray-700">
                   {['small', 'normal', 'large', 'xl'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setLocalFontSize(size)}
                        className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                          localFontSize === size 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {size === 'small' ? 'S' : size === 'normal' ? 'M' : size === 'large' ? 'L' : 'XL'}
                      </button>
                   ))}
                </div>
              </div>
            </div>

            {/* Export / Import */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <HardDrive size={18} className="text-red-400" />
                Управление настройками
              </label>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg transition-all font-medium"
                >
                  <Download size={18} />
                  Экспорт
                </button>

                <label className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-lg transition-all cursor-pointer font-medium">
                  <Upload size={18} />
                  Импорт
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-3">
                <p className="text-xs text-blue-300 flex flex-col gap-1">
                  <span className="flex items-center gap-1"><Save size={12} /> Экспорт сохраняет все настройки и конфигурацию</span>
                  <span className="flex items-center gap-1"><Upload size={12} /> Импорт восстанавливает настройки из файла</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer with Save Button */}
          <div className="p-6 border-t border-gray-700 bg-[#0F1419] rounded-b-xl">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-all font-bold text-lg shadow-lg shadow-green-900/20"
            >
              <Save size={20} />
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
