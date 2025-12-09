import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#1A232E] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100 animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#0F1419]">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={20} />
            <h3 className="font-semibold text-white">{title || 'Подтверждение'}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            {message || 'Вы уверены, что хотите выполнить это действие?'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-[#0F1419] border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-900/20 transition-colors flex items-center gap-2"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
