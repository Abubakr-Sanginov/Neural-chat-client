import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileCode, FileType } from 'lucide-react';
import { exportToMarkdown, exportToDocx, exportToPdf, exportToJson } from '../utils/exportUtils';

const ChatExport = ({ chat, title, chatId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setIsOpen(false);
    const exportTitle = title || 'Chat Export';
    
    switch (format) {
      case 'markdown':
        exportToMarkdown(chat, exportTitle);
        break;
      case 'docx':
        await exportToDocx(chat, exportTitle);
        break;
      case 'pdf':
        // We need the ID of the chat container. 
        // Assuming the main chat container has id="chat-container" or similar.
        // If not, we might need to pass a ref or ID.
        // For now, let's try to find the chat body wrapper.
        // In ChatPage, we should ensure the chat list has an ID.
        await exportToPdf('chat-messages-container', exportTitle);
        break;
      case 'json':
        exportToJson(chat, exportTitle);
        break;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors group disabled:opacity-50"
        disabled={!chat || chat.length === 0}
        title="Export Chat"
      >
        <Download size={18} className="text-gray-400 group-hover:text-blue-400" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1A232E] border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleExport('markdown')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
            >
              <FileCode size={16} className="text-blue-400" />
              <span>Markdown (.md)</span>
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
            >
              <FileText size={16} className="text-blue-400" />
              <span>Word (.docx)</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
            >
              <FileType size={16} className="text-red-400" />
              <span>PDF (.pdf)</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
            >
              <FileCode size={16} className="text-yellow-400" />
              <span>JSON (.json)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatExport;
