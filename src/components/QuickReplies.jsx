import { Zap } from 'lucide-react';

const QUICK_REPLIES = [
  { id: 1, text: 'Объясни это проще', icon: '🎯' },
  { id: 2, text: 'Приведи примеры', icon: '📝' },
  { id: 3, text: 'Продолжи', icon: '➡️' },
  { id: 4, text: 'Исправь ошибки в коде', icon: '🐛' },
  { id: 5, text: 'Оптимизируй это', icon: '⚡' },
  { id: 6, text: 'Переведи на английский', icon: '🌐' },
  { id: 7, text: 'Сделай краткое резюме', icon: '📋' },
  { id: 8, text: 'Что еще я могу спросить?', icon: '💡' },
];

export default function QuickReplies({ onSelect, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="quick-replies">
      <div className="quick-replies-header">
        <Zap size={14} />
        <span>Быстрые ответы</span>
      </div>
      <div className="quick-replies-grid">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply.id}
            className="quick-reply-btn"
            onClick={() => onSelect(reply.text)}
          >
            <span className="quick-reply-icon">{reply.icon}</span>
            <span className="quick-reply-text">{reply.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
