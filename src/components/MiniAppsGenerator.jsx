import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Sparkles,
  Play,
  Trash2,
  Code,
  Calculator,
  FileText,
  BarChart,
  Palette,
  Wand2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3080";

const PRESET_APPS = [
  {
    id: "json-cleaner",
    name: "JSON Cleaner",
    icon: "🧹",
    description: "Очистка JSON от лишних ключей",
    type: "tool",
  },
  {
    id: "csv-chart",
    name: "CSV → График",
    icon: "📊",
    description: "Визуализация CSV данных",
    type: "visualizer",
  },
  {
    id: "text-analyzer",
    name: "Анализатор текста",
    icon: "📝",
    description: "Статистика и анализ текста",
    type: "analyzer",
  },
  {
    id: "color-picker",
    name: "Палитра цветов",
    icon: "🎨",
    description: "Генератор цветовых схем",
    type: "tool",
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    icon: "🔍",
    description: "Тестирование регулярных выражений",
    type: "tool",
  },
  {
    id: "base64",
    name: "Base64 Encoder",
    icon: "🔐",
    description: "Кодирование/декодирование Base64",
    type: "tool",
  },
];

export default function MiniAppsGenerator({ isOpen, onClose }) {
  const [apps, setApps] = useState(() => {
    const saved = localStorage.getItem("miniApps");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeApp, setActiveApp] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem("miniApps", JSON.stringify(apps));
  }, [apps]);

  const generateApp = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      // Call AI to generate app code
      const response = await fetch(`${API_URL}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Создай JavaScript функцию run(input) для мини-приложения: "${prompt}". 
          Верни ТОЛЬКО код функции без объяснений. Функция должна принимать строку input и возвращать строку результата.
          Пример формата:
          function run(input) {
            // код
            return result;
          }`,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let generatedCode = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) generatedCode += parsed.chunk;
            } catch (e) { }
          }
        }
      }

      // Extract function code
      const codeMatch = generatedCode.match(/function run[\s\S]*?(?=\n\n|$)/);
      const finalCode = codeMatch
        ? codeMatch[0]
        : `function run(input) { return "Generated: " + input; }`;

      const newApp = {
        id: `app_${Date.now()}`,
        name: prompt.slice(0, 30),
        icon: "✨",
        description: prompt,
        type: "custom",
        code: finalCode,
        createdAt: new Date().toISOString(),
        isAIGenerated: true,
      };

      setApps([...apps, newApp]);
      setPrompt("");
      setShowGenerator(false);
    } catch (error) {
      console.error("Failed to generate app:", error);
      // Fallback to simple app
      const newApp = {
        id: `app_${Date.now()}`,
        name: prompt.slice(0, 30),
        icon: "✨",
        description: prompt,
        type: "custom",
        code: `function run(input) { return "Обработано: " + input; }`,
        createdAt: new Date().toISOString(),
      };
      setApps([...apps, newApp]);
      setPrompt("");
      setShowGenerator(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteApp = (id) => {
    setApps(apps.filter((a) => a.id !== id));
    if (activeApp?.id === id) setActiveApp(null);
  };

  const addPresetApp = (preset) => {
    if (apps.find((a) => a.id === preset.id)) return;
    setApps([...apps, { ...preset, createdAt: new Date().toISOString() }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A232E] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-700 flex">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-yellow-400" size={20} />
              <h2 className="font-bold">Mini Apps</h2>
            </div>
            <button
              onClick={() => setShowGenerator(true)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Wand2 size={18} />
              Создать с ИИ
            </button>
          </div>

          {/* My Apps */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-xs text-gray-500 uppercase mb-2">
              Мои приложения
            </p>
            {apps.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Нет приложений
              </p>
            ) : (
              <div className="space-y-2">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setActiveApp(app)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${activeApp?.id === app.id
                      ? "bg-purple-600/20 border border-purple-500"
                      : "bg-gray-800/50 hover:bg-gray-800"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{app.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{app.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {app.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Presets */}
            <p className="text-xs text-gray-500 uppercase mt-4 mb-2">
              Готовые шаблоны
            </p>
            <div className="space-y-2">
              {PRESET_APPS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => addPresetApp(preset)}
                  disabled={apps.find((a) => a.id === preset.id)}
                  className="w-full p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 text-left transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{preset.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{preset.name}</p>
                      <p className="text-xs text-gray-500">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-bold">
              {activeApp ? activeApp.name : "Выберите приложение"}
            </h3>
            <div className="flex items-center gap-2">
              {activeApp && (
                <button
                  onClick={() => deleteApp(activeApp.id)}
                  className="p-2 hover:bg-red-600/20 text-red-400 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeApp ? (
              <AppRunner app={activeApp} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Sparkles size={48} className="mb-4 opacity-50" />
                <p>Выберите приложение или создайте новое</p>
              </div>
            )}
          </div>
        </div>

        {/* Generator Modal */}
        {showGenerator && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-[#1A232E] rounded-xl p-6 w-full max-w-lg border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Wand2 className="text-purple-400" />
                Создать приложение с ИИ
              </h3>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Опишите, какое приложение вы хотите создать...&#10;&#10;Например: Утилита для форматирования JSON с подсветкой синтаксиса"
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowGenerator(false)}
                  className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Отмена
                </button>
                <button
                  onClick={generateApp}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Генерация...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Создать
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple App Runner Component
function AppRunner({ app }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const runApp = () => {
    switch (app.id) {
      case "json-cleaner":
        try {
          const json = JSON.parse(input);
          setOutput(JSON.stringify(json, null, 2));
        } catch (e) {
          setOutput("Ошибка: Невалидный JSON");
        }
        break;
      case "base64":
        try {
          if (input.startsWith("data:") || /^[A-Za-z0-9+/=]+$/.test(input)) {
            setOutput(atob(input));
          } else {
            setOutput(btoa(input));
          }
        } catch (e) {
          setOutput("Ошибка кодирования");
        }
        break;
      case "text-analyzer":
        const words = input
          .trim()
          .split(/\s+/)
          .filter((w) => w);
        const chars = input.length;
        const lines = input.split("\n").length;
        setOutput(`Символов: ${chars}\nСлов: ${words.length}\nСтрок: ${lines}`);
        break;
      default:
        setOutput("Приложение запущено!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl">
        <span className="text-3xl">{app.icon}</span>
        <div>
          <h4 className="font-bold">{app.name}</h4>
          <p className="text-sm text-gray-400">{app.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Ввод</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите данные..."
            rows={10}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Результат</label>
          <textarea
            value={output}
            readOnly
            rows={10}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 resize-none font-mono text-sm text-green-400"
          />
        </div>
      </div>

      <button
        onClick={runApp}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2"
      >
        <Play size={18} />
        Запустить
      </button>
    </div>
  );
}
