import { Edit2, Trash2, Check, X, CheckSquare, Square, Star, Archive, FolderInput } from "lucide-react";
import { useState } from "react";

function ChatItem({
  savedChat,
  chatId,
  editingChatId,
  editingTitle,
  setEditingTitle,
  handleLoadChat,
  handleRenameChat,
  startEditing,
  cancelEditing,
  handleDeleteChat,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  isFavorite,
  onToggleFavorite,
  onArchiveChat,
  folders = [],
  onMoveToFolder,
}) {
  const [showFolderMenu, setShowFolderMenu] = useState(false);

  return (
    <div
      className={`group p-3 mb-2 rounded-lg transition-all duration-200 border border-transparent ${
        isSelectionMode 
          ? isSelected 
            ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-blue-500" 
            : "hover:border-blue-500/30 hover:bg-[#1A232E]"
          : `hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-[#1A232E] hover:to-[#243447] ${
              savedChat.id === chatId ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50" : "hover:shadow-lg hover:shadow-blue-500/10"
            }`
      }`}
      onClick={() => {
        if (isSelectionMode) {
          onToggleSelect(savedChat.id);
        }
      }}
      onMouseLeave={() => setShowFolderMenu(false)}
    >
      {editingChatId === savedChat.id ? (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="bg-[#2A3441] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameChat(savedChat.id, editingTitle);
              } else if (e.key === "Escape") {
                cancelEditing();
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleRenameChat(savedChat.id, editingTitle)}
              className="text-green-500 hover:text-green-400 flex-1 py-1.5 rounded bg-green-500/10 hover:bg-green-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Check size={16} />
              <span className="text-xs font-medium">Save</span>
            </button>
            <button
              onClick={cancelEditing}
              className="text-gray-400 hover:text-gray-300 flex-1 py-1.5 rounded bg-gray-500/10 hover:bg-gray-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <X size={16} />
              <span className="text-xs font-medium">Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2">
            {isSelectionMode && (
              <div className="flex-shrink-0 mt-1">
                {isSelected ? (
                  <CheckSquare size={20} className="text-blue-400" />
                ) : (
                  <Square size={20} className="text-gray-500" />
                )}
              </div>
            )}
            <div
              onClick={(e) => {
                if (!isSelectionMode) {
                  handleLoadChat(savedChat.id);
                }
              }}
              className={`flex-1 min-w-0 ${!isSelectionMode ? 'cursor-pointer' : ''}`}
            >
              <p className="text-sm font-medium truncate mb-1 group-hover:text-blue-400 transition-colors">{savedChat.title}</p>
              <p className="text-xs text-gray-500">
                {savedChat.messageCount} сообщений
              </p>
            </div>
          </div>
          {!isSelectionMode && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 relative">
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(savedChat.id);
                  }}
                  className={`hover:bg-yellow-500/10 p-2 rounded transition-all ${
                    isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                  title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                >
                  <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
              
              {/* Folder Move Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFolderMenu(!showFolderMenu);
                  }}
                  className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 p-2 rounded transition-all"
                  title="Переместить в папку"
                >
                  <FolderInput size={16} />
                </button>
                
                {showFolderMenu && folders.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-[#1A232E] border border-gray-700 rounded shadow-xl z-50 max-h-40 overflow-y-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToFolder(savedChat.id, null);
                        setShowFolderMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white truncate"
                    >
                      No Folder
                    </button>
                    {folders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToFolder(savedChat.id, folder.id);
                          setShowFolderMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white truncate"
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(savedChat.id, savedChat.title);
                }}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 rounded transition-all"
                title="Редактировать"
              >
                <Edit2 size={16} />
              </button>
              {onArchiveChat && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiveChat(savedChat.id);
                  }}
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 p-2 rounded transition-all"
                  title="Архивировать"
                >
                  <Archive size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(savedChat.id);
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded transition-all"
                title="Удалить"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ChatItem;
