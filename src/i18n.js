// Simple i18n translation system

const translations = {
  en: {
    // Header
    'header.title': 'Chatting with Gemini',
    'header.stats': 'STATS',
    'header.favorites': 'Favorites',
    
    // Sidebar
    'sidebar.newChat': 'New Chat',
    'sidebar.settings': 'Settings',
    'sidebar.model': 'Model',
    'sidebar.search': 'Search chats...',
    'sidebar.today': 'Today',
    'sidebar.yesterday': 'Yesterday',
    'sidebar.lastWeek': 'Last 7 days',
    'sidebar.older': 'Older',
    'sidebar.messages': 'messages',
    
    // Chat
    'chat.stopGenerating': 'Stop Generating',
    'chat.quickReplies': 'Quick Replies',
    'chat.showQuickReplies': 'Show Quick Replies',
    'chat.hideQuickReplies': 'Hide Quick Replies',
    'chat.typingIndicator': 'AI is typing...',
    
    // Settings
    'settings.title': 'Settings',
    'settings.systemInstructions': 'System Instructions',
    'settings.systemInstructionsPlaceholder': 'e.g., You are a helpful coding assistant...',
    'settings.save': 'Save',
    'settings.saveAndClose': 'Save & Close',
    'settings.keyboardShortcuts': 'Keyboard Shortcuts',
    'settings.language': 'Language',
    
    // Actions
    'actions.edit': 'Edit',
    'actions.delete': 'Delete',
    'actions.copy': 'Copy',
    'actions.regenerate': 'Regenerate',
    'actions.pin': 'Pin',
    'actions.unpin': 'Unpin',
    'actions.favorite': 'Add to Favorites',
    
    // Messages
    'message.user': 'You',
    'message.ai': 'AI',
    'message.deleteConfirm': 'Delete this chat?',
    'message.error': 'Error: Failed to get response',
    
    // Templates
    'templates.title': 'Conversation Templates',
    'templates.create': 'Create Custom Template',
    'templates.custom': 'Custom',
    
    // Backup
    'backup.title': 'Auto-Backup & Restore',
    'backup.lastBackup': 'Last auto-backup',
    'backup.download': 'Download Backup',
    'backup.restore': 'Restore Backup',
    
    // Token Tracker
    'tokens.title': 'tokens',
    'tokens.cost': 'est. cost',
  },
  
  ru: {
    // Header
    'header.title': 'Чат с Gemini',
    'header.stats': 'СТАТИСТИКА',
    'header.favorites': 'Избранное',
    
    // Sidebar
    'sidebar.newChat': 'Новый чат',
    'sidebar.settings': 'Настройки',
    'sidebar.model': 'Модель',
    'sidebar.search': 'Поиск чатов...',
    'sidebar.today': 'Сегодня',
    'sidebar.yesterday': 'Вчера',
    'sidebar.lastWeek': 'Последние 7 дней',
    'sidebar.older': 'Старые',
    'sidebar.messages': 'сообщений',
    
    // Chat
    'chat.stopGenerating': 'Остановить генерацию',
    'chat.quickReplies': 'Быстрые ответы',
    'chat.showQuickReplies': 'Показать быстрые ответы',
    'chat.hideQuickReplies': 'Скрыть быстрые ответы',
    'chat.typingIndicator': 'AI печатает...',
    
    // Settings
    'settings.title': 'Настройки',
    'settings.systemInstructions': 'Системные инструкции',
    'settings.systemInstructionsPlaceholder': 'например, Вы полезный помощник по программированию...',
    'settings.save': 'Сохранить',
    'settings.saveAndClose': 'Сохранить и закрыть',
    'settings.keyboardShortcuts': 'Горячие клавиши',
    'settings.language': 'Язык',
    
    // Actions
    'actions.edit': 'Редактировать',
    'actions.delete': 'Удалить',
    'actions.copy': 'Копировать',
    'actions.regenerate': 'Регенерировать',
    'actions.pin': 'Закрепить',
    'actions.unpin': 'Открепить',
    'actions.favorite': 'Добавить в избранное',
    
    // Messages
    'message.user': 'Вы',
    'message.ai': 'AI',
    'message.deleteConfirm': 'Удалить этот чат?',
    'message.error': 'Ошибка: Не удалось получить ответ',
    
    // Templates
    'templates.title': 'Шаблоны разговоров',
    'templates.create': 'Создать пользовательский шаблон',
    'templates.custom': 'Пользовательский',
    
    // Backup
    'backup.title': 'Автосохранение и восстановление',
    'backup.lastBackup': 'Последнее автосохранение',
    'backup.download': 'Скачать резервную копию',
    'backup.restore': 'Восстановить из копии',
    
    // Token Tracker
    'tokens.title': 'токенов',
    'tokens.cost': 'прим. стоимость',
  }
};

let currentLanguage = 'ru'; // Default to Russian

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
  }
};

export const getLanguage = () => {
  const saved = localStorage.getItem('language');
  if (saved && translations[saved]) {
    currentLanguage = saved;
  }
  return currentLanguage;
};

export const t = (key) => {
  return translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
};

// Initialize language on load
getLanguage();

export default { t, setLanguage, getLanguage };
