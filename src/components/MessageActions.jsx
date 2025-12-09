import { RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function MessageActions({ message, index, onRegenerate, onCopy, onEdit }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="message-actions">
      {message.sender === 'ai' && (
        <button
          className="action-btn"
          onClick={() => onRegenerate(index)}
          title="Regenerate response"
        >
          <RefreshCw size={14} />
        </button>
      )}
      
      <button
        className="action-btn"
        onClick={handleCopy}
        title="Copy message"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
