import { Columns, X } from 'lucide-react';
import ChatBody from './ChatBody';
import { useState, useEffect } from 'react';

export default function ChatComparison({ 
  chat1, 
  chat2, 
  chat1Title, 
  chat2Title, 
  isOpen, 
  onClose 
}) {
  const [syncScroll, setSyncScroll] = useState(true);
  const [scrollLeft, setScrollLeft] = useState(null);
  const [scrollRight, setScrollRight] = useState(null);

  const handleScrollLeft = (e) => {
    if (syncScroll && scrollRight) {
      const scrollPercentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
      scrollRight.scrollTop = scrollPercentage * (scrollRight.scrollHeight - scrollRight.clientHeight);
    }
  };

  const handleScrollRight = (e) => {
    if (syncScroll && scrollLeft) {
      const scrollPercentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
      scrollLeft.scrollTop = scrollPercentage * (scrollLeft.scrollHeight - scrollLeft.clientHeight);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1A232E] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#0F1419]">
        <div className="flex items-center gap-2">
          <Columns size={24} />
          <h2 className="text-xl font-bold">Chat Comparison</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Sync Scroll</span>
          </label>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Chat */}
        <div className="flex-1 flex flex-col border-r border-gray-700">
          <div className="bg-[#0F1419] px-4 py-3 border-b border-gray-700">
            <h3 className="font-semibold text-blue-400">{chat1Title || 'Chat 1'}</h3>
            <p className="text-xs text-gray-500">{chat1.length} messages</p>
          </div>
          <div
            ref={setScrollLeft}
            onScroll={handleScrollLeft}
            className="flex-1 overflow-y-auto p-4 scrollbar-thumb-slate-400 scrollbar-thin"
          >
            {chat1.length > 0 ? (
              <ChatBody chat={chat1} onEditMessage={() => {}} onDeleteMessage={() => {}} readOnly />
            ) : (
              <div className="text-center text-gray-500 mt-8">No messages</div>
            )}
          </div>
        </div>

        {/* Right Chat */}
        <div className="flex-1 flex flex-col">
          <div className="bg-[#0F1419] px-4 py-3 border-b border-gray-700">
            <h3 className="font-semibold text-green-400">{chat2Title || 'Chat 2'}</h3>
            <p className="text-xs text-gray-500">{chat2.length} messages</p>
          </div>
          <div
            ref={setScrollRight}
            onScroll={handleScrollRight}
            className="flex-1 overflow-y-auto p-4 scrollbar-thumb-slate-400 scrollbar-thin"
          >
            {chat2.length > 0 ? (
              <ChatBody chat={chat2} onEditMessage={() => {}} onDeleteMessage={() => {}} readOnly />
            ) : (
              <div className="text-center text-gray-500 mt-8">No messages</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
