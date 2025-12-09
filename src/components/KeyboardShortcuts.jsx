import { useEffect, useCallback } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useState } from 'react';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], action: 'search', description: 'Поиск по сообщениям' },
  { keys: ['Ctrl', 'N'], action: 'newChat', description: 'Новый чат' },
  { keys: ['Ctrl', '/'], action: 'commands', description: 'Показать команды' },
  { keys: ['Ctrl', 'S'], action: 'save', description: 'Сохранить чат' },
  { keys: ['Ctrl', 'E'], action: 'export', description: 'Экспорт чата' },
  { keys: ['Escape'], action: 'close', description: 'Закрыть модальное окно' },
  { keys: ['Ctrl', 'Enter'], action: 'send', description: 'Отправить сообщение' },
];

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K - Search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        handlers.search?.();
      }
      // Ctrl+N - New Chat
      else if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handlers.newChat?.();
      }
      // Ctrl+/ - Commands
      else if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        handlers.commands?.();
      }
      // Ctrl+S - Save
      else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handlers.save?.();
      }
      // Ctrl+E - Export
      else if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        handlers.export?.();
      }
      // Escape - Close
      else if (e.key === 'Escape') {
        handlers.close?.();
      }
      // Ctrl+Enter - Send
      else if (e.ctrlKey && e.key === 'Enter') {
        handlers.send?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

export function ShortcutsHelp({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <Keyboard size={24} />
          <h2>Горячие клавиши</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="shortcuts-list">
          {SHORTCUTS.map((shortcut, idx) => (
            <div key={idx} className="shortcut-item">
              <div className="shortcut-keys">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd>{key}</kbd>
                    {i < shortcut.keys.length - 1 && <span className="key-plus">+</span>}
                  </span>
                ))}
              </div>
              <span className="shortcut-description">{shortcut.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
