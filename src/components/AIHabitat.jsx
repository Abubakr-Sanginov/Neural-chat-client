import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Bot,
  Sparkles,
  Brain,
  Zap,
  Users,
  Settings,
  Play,
  Pause,
  Trash2,
} from "lucide-react";

const DEFAULT_CLONES = [
  {
    id: "default",
    name: "Gemini Assistant",
    role: "Универсальный помощник",
    avatar: "🤖",
    color: "blue",
    instruction:
      "Ты универсальный AI-помощник. Отвечай полезно и дружелюбно на любые вопросы.",
    stats: { messages: 0, tasks: 0 },
    isActive: true,
  },
  {
    id: "coder",
    name: "Code Expert",
    role: "Эксперт по программированию",
    avatar: "💻",
    color: "green",
    instruction:
      "Ты эксперт по программированию. Пиши чистый, эффективный код. Объясняй решения. Используй лучшие практики. Предлагай оптимизации.",
    stats: { messages: 0, tasks: 0 },
    isActive: false,
  },
  {
    id: "analyst",
    name: "Data Analyst",
    role: "Аналитик данных",
    avatar: "📊",
    color: "purple",
    instruction:
      "Ты аналитик данных. Анализируй информацию, находи паттерны, делай выводы. Визуализируй данные когда возможно.",
    stats: { messages: 0, tasks: 0 },
    isActive: false,
  },
  {
    id: "creative",
    name: "Creative Writer",
    role: "Креативный писатель",
    avatar: "✍️",
    color: "orange",
    instruction:
      "Ты креативный писатель. Пиши увлекательно, используй метафоры, создавай яркие образы. Помогай с текстами любого формата.",
    stats: { messages: 0, tasks: 0 },
    isActive: false,
  },
];

export default function AIHabitat({
  isOpen,
  onClose,
  onSelectClone,
  currentCloneId,
}) {
  const [clones, setClones] = useState(() => {
    const saved = localStorage.getItem("aiClones");
    return saved ? JSON.parse(saved) : DEFAULT_CLONES;
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClone, setNewClone] = useState({
    name: "",
    role: "",
    avatar: "🤖",
    instruction: "",
  });

  useEffect(() => {
    localStorage.setItem("aiClones", JSON.stringify(clones));
  }, [clones]);

  const createClone = () => {
    if (!newClone.name || !newClone.role) return;

    const clone = {
      id: `clone_${Date.now()}`,
      ...newClone,
      color: ["blue", "purple", "green", "orange", "pink"][
        Math.floor(Math.random() * 5)
      ],
      stats: { messages: 0, tasks: 0 },
      isActive: false,
      createdAt: new Date().toISOString(),
    };

    setClones([...clones, clone]);
    setNewClone({ name: "", role: "", avatar: "🤖", instruction: "" });
    setShowCreateModal(false);
  };

  const deleteClone = (id) => {
    if (id === "default") return;
    setClones(clones.filter((c) => c.id !== id));
  };

  const toggleClone = (id) => {
    setClones(
      clones.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A232E] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-xl">
              <Brain className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Habitat</h2>
              <p className="text-sm text-gray-400">
                Ваша колония ИИ-помощников
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Bot size={18} />
                <span className="text-sm">Всего клонов</span>
              </div>
              <p className="text-2xl font-bold">{clones.length}</p>
            </div>
            <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <Zap size={18} />
                <span className="text-sm">Активных</span>
              </div>
              <p className="text-2xl font-bold">
                {clones.filter((c) => c.isActive).length}
              </p>
            </div>
            <div className="bg-purple-600/10 border border-purple-600/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Sparkles size={18} />
                <span className="text-sm">Сообщений</span>
              </div>
              <p className="text-2xl font-bold">
                {clones.reduce((acc, c) => acc + c.stats.messages, 0)}
              </p>
            </div>
          </div>

          {/* Clones Grid */}
          <div className="grid grid-cols-2 gap-4">
            {clones.map((clone) => (
              <div
                key={clone.id}
                className={`relative bg-gray-800/50 border rounded-xl p-4 cursor-pointer transition-all hover:border-${
                  clone.color
                }-500 ${
                  currentCloneId === clone.id
                    ? `border-${clone.color}-500 ring-2 ring-${clone.color}-500/30`
                    : "border-gray-700"
                }`}
                onClick={() => onSelectClone(clone)}
              >
                {/* Status indicator */}
                <div
                  className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                    clone.isActive
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-500"
                  }`}
                />

                <div className="flex items-start gap-3">
                  <div
                    className={`text-4xl p-2 bg-${clone.color}-600/20 rounded-xl`}
                  >
                    {clone.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{clone.name}</h3>
                    <p className="text-sm text-gray-400">{clone.role}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{clone.stats.messages} сообщений</span>
                      <span>{clone.stats.tasks} задач</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleClone(clone.id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-sm ${
                      clone.isActive
                        ? "bg-green-600/20 text-green-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {clone.isActive ? <Pause size={14} /> : <Play size={14} />}
                    {clone.isActive ? "Активен" : "Запустить"}
                  </button>
                  {clone.id !== "default" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteClone(clone.id);
                      }}
                      className="p-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Clone */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-purple-500 hover:bg-purple-500/5 transition-all"
            >
              <Plus size={32} className="text-gray-500" />
              <span className="text-gray-400">Создать клона</span>
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-[#1A232E] rounded-xl p-6 w-full max-w-md border border-gray-700">
              <h3 className="text-lg font-bold mb-4">Создать ИИ-клона</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={newClone.name}
                    onChange={(e) =>
                      setNewClone({ ...newClone, name: e.target.value })
                    }
                    placeholder="Например: React-помощник"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Роль
                  </label>
                  <input
                    type="text"
                    value={newClone.role}
                    onChange={(e) =>
                      setNewClone({ ...newClone, role: e.target.value })
                    }
                    placeholder="Например: Эксперт по React и фронтенду"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Аватар (эмодзи)
                  </label>
                  <div className="flex gap-2">
                    {["🤖", "🧠", "💡", "🚀", "⚡", "🎯", "📊", "💻"].map(
                      (emoji) => (
                        <button
                          key={emoji}
                          onClick={() =>
                            setNewClone({ ...newClone, avatar: emoji })
                          }
                          className={`text-2xl p-2 rounded-lg ${
                            newClone.avatar === emoji
                              ? "bg-purple-600/30 ring-2 ring-purple-500"
                              : "bg-gray-800"
                          }`}
                        >
                          {emoji}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Системная инструкция
                  </label>
                  <textarea
                    value={newClone.instruction}
                    onChange={(e) =>
                      setNewClone({ ...newClone, instruction: e.target.value })
                    }
                    placeholder="Опишите поведение и специализацию ИИ..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Отмена
                </button>
                <button
                  onClick={createClone}
                  className="flex-1 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
