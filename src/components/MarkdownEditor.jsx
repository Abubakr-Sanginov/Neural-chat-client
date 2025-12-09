import { useState } from 'react';
import { Bold, Italic, Code, List, ListOrdered, Link, X, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

export default function MarkdownEditor({ isOpen, onClose, onInsert }) {
  const [text, setText] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  const insertFormat = (before, after = '') => {
    const textarea = document.getElementById('md-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end) || 'text';
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setText(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleInsert = () => {
    onInsert(text);
    setText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#1A232E] w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl border border-gray-700 flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Markdown Editor</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-700 flex-wrap">
          <button
            onClick={() => insertFormat('**', '**')}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => insertFormat('*', '*')}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => insertFormat('`', '`')}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Inline Code"
          >
            <Code size={18} />
          </button>
          <button
            onClick={() => insertFormat('```\n', '\n```')}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Code Block"
          >
            <Code size={18} className="opacity-50" />
          </button>
          <button
            onClick={() => insertFormat('- ', '')}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => insertFormat('1. ', '')}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>
          <button
            onClick={() => insertFormat('[', '](url)')}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Link"
          >
            <Link size={18} />
          </button>
          
          <div className="flex-1" />
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 rounded transition-colors ${showPreview ? 'bg-blue-600' : 'hover:bg-white/10'}`}
            title="Toggle Preview"
          >
            <Eye size={18} />
          </button>
        </div>

        {/* Editor/Preview */}
        <div className="flex-1 overflow-hidden flex">
          {/* Editor */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-700 flex flex-col`}>
            <div className="p-2 bg-[#0F1419] text-xs text-gray-400 border-b border-gray-700">
              Editor
            </div>
            <textarea
              id="md-editor"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-transparent p-4 outline-none resize-none font-mono text-sm"
              placeholder="Type your markdown here..."
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 flex flex-col">
              <div className="p-2 bg-[#0F1419] text-xs text-gray-400 border-b border-gray-700">
                Preview
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  className="prose prose-invert max-w-none"
                >
                  {text || '*Preview will appear here...*'}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <span className="text-sm text-gray-400">
            {text.length} characters
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 hover:bg-white/10 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              disabled={!text}
            >
              Insert to Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
