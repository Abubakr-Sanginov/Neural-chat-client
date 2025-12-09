import { useState } from 'react';
import { Folder, FolderPlus, Edit2, Trash2, ChevronRight, ChevronDown, X } from 'lucide-react';

export default function FolderManager({ 
  folders = [], 
  onCreateFolder, 
  onUpdateFolder, 
  onDeleteFolder,
  onMoveToFolder,
  selectedFolder,
  onSelectFolder 
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  const handleUpdateFolder = (id) => {
    if (editName.trim()) {
      onUpdateFolder(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const toggleFolder = (id) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  return (
    <div className="p-4 bg-[#1A232E] rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Folder size={18} className="text-yellow-500" />
          Folders
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Create folder"
        >
          <FolderPlus size={16} />
        </button>
      </div>

      {/* Create New Folder */}
      {isCreating && (
        <div className="mb-3 p-2 bg-white/5 rounded flex gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="flex-1 bg-transparent border-0 outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewFolderName('');
              }
            }}
          />
          <button
            onClick={handleCreateFolder}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            Create
          </button>
          <button
            onClick={() => {
              setIsCreating(false);
              setNewFolderName('');
            }}
            className="p-1 hover:bg-white/10 rounded"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* All Chats (No Folder) */}
      <button
        onClick={() => onSelectFolder(null)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors mb-1 ${
          selectedFolder === null 
            ? 'bg-blue-600' 
            : 'hover:bg-white/10'
        }`}
      >
        <Folder size={16} />
        <span className="flex-1 text-left">All Chats</span>
      </button>

      {/* Folder List */}
      <div className="space-y-1">
        {folders.map((folder) => (
          <div key={folder.id}>
            {editingId === folder.id ? (
              <div className="flex gap-2 p-2 bg-white/5 rounded">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateFolder(folder.id);
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditName('');
                    }
                  }}
                />
                <button
                  onClick={() => handleUpdateFolder(folder.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditName('');
                  }}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors group ${
                  selectedFolder === folder.id 
                    ? 'bg-blue-600' 
                    : 'hover:bg-white/10'
                }`}
              >
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="p-0.5 hover:bg-white/10 rounded"
                >
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                
                <Folder size={16} className="text-yellow-500" />
                
                <button
                  onClick={() => onSelectFolder(folder.id)}
                  className="flex-1 text-left"
                >
                  {folder.name}
                </button>

                <span className="text-xs text-gray-500 mr-2">
                  {folder.chatCount || 0}
                </span>

                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={() => {
                      setEditingId(folder.id);
                      setEditName(folder.name);
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Rename"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteFolder(folder.id)}
                    className="p-1 hover:bg-red-500/20 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            )}

{/* Subfolder content could go here if expanded */}
          </div>
        ))}
      </div>

      {folders.length === 0 && !isCreating && (
        <div className="text-center text-gray-500 py-4 text-sm">
          No folders yet. Create one to organize your chats!
        </div>
      )}
    </div>
  );
}
