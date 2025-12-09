import { CheckSquare, Square, Trash2, Archive, FolderInput, X } from 'lucide-react';

export default function BulkActions({ 
  selectedChats = [], 
  onSelectAll, 
  onDeselectAll,
  onBulkDelete,
  onBulkArchive,
  onBulkMoveToFolder,
  totalChats 
}) {
  if (selectedChats.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-2xl px-6 py-4 flex items-center gap-4 z-50 animate-slide-up">
      {/* Selected Count */}
      <div className="flex items-center gap-2 border-r border-white/30 pr-4">
        <CheckSquare size={20} />
        <span className="font-semibold">{selectedChats.length} selected</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {selectedChats.length < totalChats ? (
          <button
            onClick={onSelectAll}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm flex items-center gap-2"
            title="Select all"
          >
            <CheckSquare size={16} />
            Select All
          </button>
        ) : (
          <button
            onClick={onDeselectAll}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm flex items-center gap-2"
            title="Deselect all"
          >
            <Square size={16} />
            Deselect All
          </button>
        )}

        <button
          onClick={onBulkMoveToFolder}
          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm flex items-center gap-2"
          title="Move to folder"
        >
          <FolderInput size={16} />
          Move
        </button>

        <button
          onClick={onBulkArchive}
          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm flex items-center gap-2"
          title="Archive selected"
        >
          <Archive size={16} />
          Archive
        </button>

        <button
          onClick={onBulkDelete}
          className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors text-sm flex items-center gap-2"
          title="Delete selected"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* Close */}
      <button
        onClick={onDeselectAll}
        className="p-2 hover:bg-white/20 rounded-full transition-colors ml-2"
        title="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
}
