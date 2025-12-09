import { Copy, Edit, Trash2, Pin } from 'lucide-react';
import { useEffect } from 'react';

export default function QuickActionsMenu({ x, y, onClose, onCopy, onEdit, onDelete, onPin }) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed bg-[#1A232E] border border-gray-700 rounded-lg shadow-2xl py-1 z-[9999] min-w-[160px]"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onCopy();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
      >
        <Copy size={16} />
        Copy
      </button>
      
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
      >
        <Edit size={16} />
        Edit
      </button>
      
      <button
        onClick={() => {
          onPin();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
      >
        <Pin size={16} />
        Pin
      </button>
      
      <div className="border-t border-gray-700 my-1"></div>
      
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm text-red-400"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  );
}
