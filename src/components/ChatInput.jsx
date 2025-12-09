import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Image as ImageIcon, X, Video, FileText, Globe } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";

const COMMANDS = [
  { cmd: '/image', desc: 'Generate an image', example: '/image a cute cat' },
  { cmd: '!image', desc: 'Generate an image (alt)', example: '!image sunset' },
];

const ChatInput = ({ sendMessage, loading, chatId, draftMessage, onDraftChange }) => {
  const [value, setValue] = useState(draftMessage || "");
  const [attachments, setAttachments] = useState([]);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

  // Restore draft when chatId changes
  useState(() => {
    setValue(draftMessage || "");
  }, [chatId, draftMessage]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`Файл "${file.name}" слишком большой! Максимальный размер: 5 ГБ.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const filePromises = validFiles.map((file) => {
      return new Promise(async (resolve) => {
        // Handle documents (PDF, DOCX, TXT)
        if (file.type === 'application/pdf' || 
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            file.type === 'text/plain') {
          
          const formData = new FormData();
          formData.append('file', file);

          try {
            const response = await fetch('http://localhost:3080/api/files/process-file', {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const { text } = await response.json();
              // Append extracted text to the message input
              setValue(prev => {
                const prefix = prev ? prev + '\n\n' : '';
                return prefix + `[Content from ${file.name}]:\n${text}\n\n`;
              });
              // We don't add documents to attachments list for visual preview as images, 
              // but we could add a "file processed" indicator if we wanted.
              // For now, let's just resolve with null to filter it out of image attachments
              resolve(null); 
              return;
            }
          } catch (error) {
            console.error("Error processing file:", error);
            alert(`Failed to process ${file.name}`);
          }
        }

        // Handle Images/Videos as before
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            data: e.target.result,
            name: file.name,
            type: file.type,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const loadedFiles = (await Promise.all(filePromises)).filter(f => f !== null);
    setAttachments((prev) => [...prev, ...loadedFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && (item.type.startsWith('image/') || item.type.startsWith('video/'))) {
        const file = item.getAsFile();
        if (file) {
          if (file.size > MAX_FILE_SIZE) {
            alert(`Файл слишком большой! Максимальный размер: 5 ГБ.`);
            continue;
          }
          files.push(file);
        }
      }
    }

    if (files.length === 0) return;

    const filePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            data: e.target.result,
            name: file.name || 'pasted-image',
            type: file.type,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const loadedFiles = await Promise.all(filePromises);
    setAttachments((prev) => [...prev, ...loadedFiles]);
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set new height (min 40px, max 160px)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 160);
    textarea.style.height = `${newHeight}px`;
  };

  // Adjust height when value changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Save draft
    if (onDraftChange) {
      onDraftChange(newValue);
    }
    
    // Check if user is typing a command
    if (newValue.startsWith('/') || newValue.startsWith('!')) {
      const filtered = COMMANDS.filter(cmd => 
        cmd.cmd.toLowerCase().startsWith(newValue.toLowerCase())
      );
      setFilteredCommands(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCommand = (cmd) => {
    setValue(cmd.example);
    setShowSuggestions(false);
    if (onDraftChange) {
      onDraftChange(cmd.example);
    }
  };

  // Formatting functions
  const applyFormatting = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = value;
    let newCursorPos = end;

    switch (format) {
      case 'bold':
        newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
        newCursorPos = end + 4;
        break;
      case 'italic':
        newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
        newCursorPos = end + 2;
        break;
      case 'code':
        newText = value.substring(0, start) + `\`${selectedText}\`` + value.substring(end);
        newCursorPos = end + 2;
        break;
      case 'codeblock':
        newText = value.substring(0, start) + `\`\`\`\n${selectedText}\n\`\`\`` + value.substring(end);
        newCursorPos = end + 8;
        break;
    }

    setValue(newText);
    if (onDraftChange) {
      onDraftChange(newText);
    }
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = () => {
    if (value === "" && attachments.length === 0) return;
    sendMessage({
      sender: "user",
      message: value || (attachments.length > 0 ? "Analyze this attachment" : ""),
      images: attachments.length > 0 ? attachments : undefined,
      useWebSearch: useWebSearch,
    });
    setValue("");
    setAttachments([]);
    setUseWebSearch(false);
    setShowSuggestions(false);
    // Clear draft
    if (onDraftChange) {
      onDraftChange("");
    }
  };

  return (
    <div className="w-full bg-white bg-opacity-10 max-h-60 rounded-lg px-4 py-4 overflow-auto relative">
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Formatting Toolbar */}
          <div className="flex gap-1 mb-2 pb-2 border-b border-gray-700">
            <button
              onClick={() => applyFormatting('bold')}
              className="px-2 py-1 hover:bg-white/10 rounded text-xs font-bold"
              title="Bold (Ctrl+B)"
            >
              B
            </button>
            <button
              onClick={() => applyFormatting('italic')}
              className="px-2 py-1 hover:bg-white/10 rounded text-xs italic"
              title="Italic (Ctrl+I)"
            >
              I
            </button>
            <button
              onClick={() => applyFormatting('code')}
              className="px-2 py-1 hover:bg-white/10 rounded text-xs font-mono"
              title="Inline Code"
            >
              {'</>'}
            </button>
            <button
              onClick={() => applyFormatting('codeblock')}
              className="px-2 py-1 hover:bg-white/10 rounded text-xs"
              title="Code Block"
            >
              {'{ }'}
            </button>
          </div>

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {attachments.map((file, index) => (
                <div key={index} className="relative group">
                  {file.type.startsWith('video/') ? (
                    <video
                      src={file.data}
                      className="h-20 w-20 object-cover rounded-lg border border-gray-600 bg-black"
                    />
                  ) : file.type.startsWith('image/') ? (
                    <img
                      src={file.data}
                      alt={file.name}
                      className="h-20 w-20 object-cover rounded-lg border border-gray-600"
                    />
                  ) : (
                    <div className="h-20 w-20 flex flex-col items-center justify-center bg-gray-800 rounded-lg border border-gray-600 p-2">
                       <FileText size={24} className="text-gray-400 mb-1" />
                       <span className="text-[10px] text-gray-300 truncate w-full text-center" title={file.name}>
                         {file.name}
                       </span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-1 sm:gap-2">
            {/* Command Suggestions Dropdown */}
            {showSuggestions && filteredCommands.length > 0 && (
              <div className="absolute bottom-16 left-0 right-0 bg-[#1A232E] border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10 mx-4">
                {filteredCommands.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectCommand(cmd)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex flex-col gap-1 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-mono font-semibold">{cmd.cmd}</span>
                      <span className="text-gray-400 text-sm">{cmd.desc}</span>
                    </div>
                    <span className="text-xs text-gray-500 group-hover:text-gray-400">Example: {cmd.example}</span>
                  </button>
                ))}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.txt,.docx"
              multiple
              className="hidden"
            />

            <button
              type= "button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 sm:p-2.5 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Attach file"
            >
              <ImageIcon size={20} />
            </button>

            <button
              onClick={() => setUseWebSearch(!useWebSearch)}
              className={`p-2 sm:p-2.5 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                useWebSearch 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              title={useWebSearch ? "Web search enabled" : "Enable web search"}
            >
              <Globe size={20} />
            </button>

            <VoiceRecorder onTranscriptReceive={(text) => setValue(text)} />

            <textarea
              ref={textareaRef}
              onKeyDown={(e) => {
                e.key === "Enter" && e.shiftKey === false && handleSubmit();
              }}
              onPaste={handlePaste}
              rows={1}
              className="border-0 bg-transparent outline-none flex-1 resize-none overflow-y-auto"
              style={{ minHeight: '40px', maxHeight: '160px' }}
              value={value}
              onChange={handleInputChange}
              placeholder="Type a message..."
            />

            <button
              onClick={handleSubmit}
              className="p-2 sm:p-2.5 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="text-[10px] text-gray-500 text-right mt-1 px-1">
            {value.length} chars
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInput;
