import { Tag, Plus, X } from 'lucide-react';
import { useState } from 'react';

const PRESET_TAGS = [
  'Работа', 'Учеба', 'Программирование', 'Идеи', 'Важное', 
  'Личное', 'Проект', 'Вопросы', 'Заметки'
];

export default function ChatTags({ chatTags = [], onTagsChange, chatId }) {
  const [isAdding, setIsAdding] = useState(false);
  const [customTag, setCustomTag] = useState('');

  const addTag = (tag) => {
    if (!chatTags.includes(tag)) {
      onTagsChange(chatId, [...chatTags, tag]);
    }
    setIsAdding(false);
    setCustomTag('');
  };

  const removeTag = (tag) => {
    onTagsChange(chatId, chatTags.filter(t => t !== tag));
  };

  const handleCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim());
    }
  };

  return (
    <div className="chat-tags">
      {chatTags.map((tag) => (
        <span key={tag} className="tag">
          <Tag size={12} />
          {tag}
          <button onClick={() => removeTag(tag)} className="tag-remove">
            <X size={12} />
          </button>
        </span>
      ))}

      {!isAdding ? (
        <button className="add-tag-btn" onClick={() => setIsAdding(true)}>
          <Plus size={14} />
          <span>Тег</span>
        </button>
      ) : (
        <div className="tag-selector">
          <div className="preset-tags">
            {PRESET_TAGS.filter(t => !chatTags.includes(t)).map((tag) => (
              <button
                key={tag}
                className="preset-tag"
                onClick={() => addTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="custom-tag-input">
            <input
              type="text"
              placeholder="Свой тег..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomTag()}
            />
            <button onClick={handleCustomTag}>✓</button>
            <button onClick={() => setIsAdding(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
