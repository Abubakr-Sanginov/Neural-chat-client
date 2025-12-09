import { Folder, FolderPlus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function ChatFolders({ 
  folders, 
  chatFolders, 
  onCreateFolder, 
  onRenameFolder, 
  onDeleteFolder,
  onMoveChat,
  children 
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['uncategorized']));
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleRename = (folderId) => {
    if (editingName.trim()) {
      onRenameFolder(folderId, editingName.trim());
      setEditingFolderId(null);
      setEditingName('');
    }
  };

  const startEditing = (folderId, currentName) => {
    setEditingFolderId(folderId);
    setEditingName(currentName);
  };

  // Group chats by folder
  const getChatsByFolder = (folderId) => {
    return Object.entries(chatFolders)
      .filter(([_, folder]) => folder === folderId)
      .map(([chatId]) => chatId);
  };

  const allFolders = [
    { id: 'uncategorized', name: 'Uncategorized', isSystem: true },
    ...folders
  ];

  return (
    <div className="chat-folders">
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-xs font-semibold text-gray-400 uppercase">Folders</span>
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="text-gray-400 hover:text-blue-400 transition-colors"
          title="Create new folder"
        >
          <FolderPlus size={14} />
        </button>
      </div>

      {isCreatingFolder && (
        <div className="mb-2 p-2 bg-[#1A232E] rounded">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') {
                setIsCreatingFolder(false);
                setNewFolderName('');
              }
            }}
            placeholder="Folder name..."
            className="w-full bg-transparent text-sm outline-none text-white mb-2"
            autoFocus
          />
          <div className="flex gap-1">
            <button
              onClick={handleCreateFolder}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs py-1 rounded"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName('');
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-xs py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {allFolders.map((folder) => {
        const chatIds = getChatsByFolder(folder.id);
        const isExpanded = expandedFolders.has(folder.id);

        return (
          <div key={folder.id} className="mb-1">
            <div
              className="flex items-center gap-2 px-2 py-1 hover:bg-[#1A232E] rounded cursor-pointer group"
              onClick={() => toggleFolder(folder.id)}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={14} className="text-blue-400" />
              
              {editingFolderId === folder.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(folder.id);
                    if (e.key === 'Escape') {
                      setEditingFolderId(null);
                      setEditingName('');
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-transparent text-xs outline-none"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-xs">{folder.name}</span>
              )}

              <span className="text-xs text-gray-500">({chatIds.length})</span>

              {!folder.isSystem && (
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(folder.id, folder.name);
                    }}
                    className="text-gray-400 hover:text-blue-400"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete folder "${folder.name}"?`)) {
                        onDeleteFolder(folder.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="ml-4 mt-1">
                {children({ folderId: folder.id, chatIds })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
