import { useState, useEffect } from "react";
import {
  X,
  Brain,
  TrendingUp,
  Lightbulb,
  Target,
  Clock,
  MessageSquare,
  Zap,
} from "lucide-react";

export default function UserLearning({ isOpen, onClose, chatHistory = [] }) {
  const [insights, setInsights] = useState(() => {
    const saved = localStorage.getItem("userInsights");
    return saved
      ? JSON.parse(saved)
      : {
          topics: {},
          timePatterns: {},
          preferredLength: "medium",
          commonActions: [],
          suggestions: [],
        };
  });

  useEffect(() => {
    if (chatHistory.length > 0) {
      analyzeUserBehavior();
    }
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem("userInsights", JSON.stringify(insights));
  }, [insights]);

  const analyzeUserBehavior = () => {
    const userMessages = chatHistory.filter((m) => m.sender === "user");

    // Analyze topics
    const topics = {};
    const keywords = {
      Программирование: [
        "код",
        "функция",
        "программ",
        "react",
        "javascript",
        "python",
        "api",
      ],
      Перевод: ["перевод", "translate", "английск", "русск"],
      Написание: ["напиши", "текст", "статья", "письмо", "сочинение"],
      Анализ: ["анализ", "объясни", "почему", "как работает"],
      Математика: ["вычисли", "посчитай", "формула", "уравнение"],
      Креатив: ["идея", "придумай", "креатив", "название"],
    };

    userMessages.forEach((msg) => {
      const text = msg.message.toLowerCase();
      Object.entries(keywords).forEach(([topic, words]) => {
        if (words.some((w) => text.includes(w))) {
          topics[topic] = (topics[topic] || 0) + 1;
        }
      });
    });

    // Calculate preferred message length
    const avgLength =
      userMessages.reduce((acc, m) => acc + m.message.length, 0) /
      (userMessages.length || 1);
    const preferredLength =
      avgLength < 50 ? "short" : avgLength < 200 ? "medium" : "long";

    // Generate suggestions based on patterns
    const suggestions = [];
    const topTopics = Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topTopics.length > 0) {
      const [topTopic] = topTopics[0];
      if (topTopic === "Программирование") {
        suggestions.push({
          icon: "💻",
          text: "Добавить Code Playground",
          action: "add_playground",
        });
        suggestions.push({
          icon: "📚",
          text: "Создать шаблоны для кода",
          action: "add_templates",
        });
      }
      if (topTopic === "Перевод") {
        suggestions.push({
          icon: "🌍",
          text: "Добавить быстрый переводчик",
          action: "add_translator",
        });
      }
      if (topTopic === "Написание") {
        suggestions.push({
          icon: "✍️",
          text: "Добавить редактор текста",
          action: "add_editor",
        });
      }
    }

    setInsights((prev) => ({
      ...prev,
      topics,
      preferredLength,
      suggestions,
      lastAnalyzed: new Date().toISOString(),
    }));
  };

  if (!isOpen) return null;

  const topTopics = Object.entries(insights.topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalMessages = Object.values(insights.topics).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A232E] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl">
              <Brain className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Обучение ИИ</h2>
              <p className="text-sm text-gray-400">
                Анализ ваших привычек и предпочтений
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
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/30 rounded-xl p-4">
              <MessageSquare className="text-blue-400 mb-2" size={20} />
              <p className="text-2xl font-bold">{totalMessages}</p>
              <p className="text-sm text-gray-400">
                Сообщений проанализировано
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-600/30 rounded-xl p-4">
              <Target className="text-purple-400 mb-2" size={20} />
              <p className="text-2xl font-bold">{topTopics.length}</p>
              <p className="text-sm text-gray-400">Основных тем</p>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-600/30 rounded-xl p-4">
              <TrendingUp className="text-green-400 mb-2" size={20} />
              <p className="text-2xl font-bold capitalize">
                {insights.preferredLength === "short"
                  ? "Краткий"
                  : insights.preferredLength === "medium"
                  ? "Средний"
                  : "Подробный"}
              </p>
              <p className="text-sm text-gray-400">Стиль общения</p>
            </div>
          </div>

          {/* Topics Analysis */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target size={18} className="text-purple-400" />
              Ваши основные темы
            </h3>
            {topTopics.length > 0 ? (
              <div className="space-y-3">
                {topTopics.map(([topic, count]) => (
                  <div key={topic} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{topic}</span>
                        <span className="text-sm text-gray-400">
                          {count} запросов
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          style={{ width: `${(count / totalMessages) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Недостаточно данных для анализа
              </p>
            )}
          </div>

          {/* AI Suggestions */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-400" />
              Рекомендации ИИ
            </h3>
            {insights.suggestions.length > 0 ? (
              <div className="space-y-2">
                {insights.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-left"
                  >
                    <span className="text-2xl">{suggestion.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{suggestion.text}</p>
                      <p className="text-xs text-gray-400">
                        На основе ваших привычек
                      </p>
                    </div>
                    <Zap size={18} className="text-yellow-400" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Продолжайте общаться с ИИ, чтобы получить персональные
                рекомендации
              </p>
            )}
          </div>

          {/* Learning Progress */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/30 rounded-lg">
                <Brain className="text-purple-400" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium">ИИ обучается на ваших данных</p>
                <p className="text-sm text-gray-400">
                  Чем больше вы общаетесь, тем лучше ИИ понимает ваши
                  потребности
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
