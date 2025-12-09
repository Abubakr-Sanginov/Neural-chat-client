import { useState } from 'react';
import { 
  Bold, Italic, Code, Link, List, ListOrdered, 
  Quote, Eye, EyeOff 
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder = "Type a message..." }) {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('rich-text-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = 
      value.substring(0, start) + 
      before + selectedText + after + 
      value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: 'Bold (Ctrl+B)' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: 'Italic (Ctrl+I)' },
    { icon: Code, action: () => insertMarkdown('`', '`'), title: 'Code' },
    { icon: Quote, action: () => insertMarkdown('> '), title: 'Quote' },
    { icon: List, action: () => insertMarkdown('- '), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertMarkdown('1. '), title: 'Numbered List' },
    { icon: Link, action: () => insertMarkdown('[', '](url)'), title: 'Link' },
  ];

  const renderPreview = () => {
    // Simple markdown preview
    let html = value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-3 text-gray-400">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>');
    
    return { __html: html };
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 pb-2 border-b border-gray-700">
        {formatButtons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.action}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title={btn.title}
            type="button"
          >
            <btn.icon size={16} />
          </button>
        ))}
        
        <div className="flex-1" />
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="p-1.5 hover:bg-white/10 rounded transition-colors flex items-center gap-1"
          title={showPreview ? "Hide Preview" : "Show Preview"}
          type="button"
        >
          {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          <span className="text-xs">{showPreview ? 'Edit' : 'Preview'}</span>
        </button>
      </div>

      {/* Input/Preview Area */}
      {showPreview ? (
        <div 
          className="prose prose-invert max-w-none p-3 bg-white/5 rounded min-h-[100px]"
          dangerouslySetInnerHTML={renderPreview()}
        />
      ) : (
        <textarea
          id="rich-text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent border-0 outline-none resize-none min-h-[100px]"
          rows={4}
        />
      )}

      {/* Markdown Hints */}
      <div className="text-xs text-gray-500">
        <span className="mr-3">**bold**</span>
        <span className="mr-3">*italic*</span>
        <span className="mr-3">`code`</span>
        <span className="mr-3">[link](url)</span>
      </div>
    </div>
  );
}
