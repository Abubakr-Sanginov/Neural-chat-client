import React, { useState, useEffect } from 'react';
import { Folder, FolderPlus, MoreVertical, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { createFolder, updateFolder, deleteFolder } from '../api';

const FolderList = ({ folders, onFolderSelect, onFolderUpdate, selectedFolderId }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleExpand = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder(newFolderName);
      setNewFolderName("");
      setIsCreating(false);
      onFolderUpdate(); // Refresh list
    } catch (error) {
      console.error("Failed to create folder", error);
    }
  };

  const handleUpdateFolder = async (id) => {
    if (!editingName.trim()) return;
    try {
      await updateFolder(id, editingName);
      setEditingFolderId(null);
      onFolderUpdate();
    } catch (error) {
      console.error("Failed to update folder", error);
    }
  };

  const handleDeleteFolder = async (id) => {
    if (window.confirm("Delete this folder? Chats will be moved to 'Unorganized'.")) {
      try {
        await deleteFolder(id);
        onFolderUpdate();
      } catch (error) {
        console.error("Failed to delete folder", error);
      }
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center px-2 mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folders</h3>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
          title="New Folder"
        >
          <FolderPlus size={14} />
        </button>
      </div>

      {isCreating && (
        <div className="px-2 mb-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            placeholder="Folder Name"
            className="w-full bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-700 focus:border-blue-500 outline-none"
            autoFocus
            onBlur={() => setIsCreating(false)}
          />
        </div>
      )}

      <div className="space-y-0.5">
        {folders.map(folder => (
          <div key={folder.id} className="group">
            <div 
              className={`flex items-center px-2 py-1.5 rounded cursor-pointer transition-colors ${
                selectedFolderId === folder.id ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-800 text-gray-300'
              }`}
              onClick={() => onFolderSelect(folder.id)}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id); }}
                className="mr-1 text-gray-500 hover:text-white"
              >
                {expandedFolders[folder.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              
              {editingFolderId === folder.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateFolder(folder.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-gray-900 text-white text-sm px-1 rounded border border-gray-700 outline-none"
                  autoFocus
                  onBlur={() => setEditingFolderId(null)}
                />
              ) : (
                <span className="flex-1 text-sm truncate flex items-center gap-2">
                  <Folder size={14} className="text-yellow-500/80" />
                  {folder.name}
                </span>
              )}

              <div className="hidden group-hover:flex gap-1">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingFolderId(folder.id); 
                    setEditingName(folder.name); 
                  }}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderList;
