import { useState, useEffect } from 'react';

export default function TypingIndicator({ isTyping }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isTyping) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping]);

  if (!isTyping) return null;

  return (
    <div className="typing-indicator">
      <div className="typing-bubble">
        <span className="typing-text">AI печатает{dots}</span>
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
