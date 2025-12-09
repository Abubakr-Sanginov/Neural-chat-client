import React, { useRef, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import MessageContent from "./MessageContent";
import { Edit2, Trash2, Check, X, Copy, Volume2, RefreshCw, Square, Download, Clock, BarChart2, Sparkles, Star } from "lucide-react";
import "highlight.js/styles/github-dark.css";

const ChatBody = ({ chat, onEditMessage, onDeleteMessage, onRegenerate, onRun, favorites, onToggleFavorite, pinnedMessages, onPinMessage, fontSize = 'normal', isAutoScrollEnabled = true, searchQuery = "" }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const aiStyle =
    "bg-[#111827] bg-opacity-40 backdrop-blur-lg dropshadow-md mr-auto";

  const parent = useRef(null);
  const bottomRef = useRef(null);

  // only for aut animations
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  //for scrolling bottom
  useEffect(() => {
    if (isAutoScrollEnabled && !searchQuery) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, isAutoScrollEnabled, searchQuery]);

  // Scroll to first match when searchQuery changes
  useEffect(() => {
    if (!searchQuery) return;
    const matchId = `message-match-first`;
    const element = document.getElementById(matchId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchQuery]);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  const startEditing = (index, text) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const confirmEdit = (index) => {
    if (editingText.trim()) {
      onEditMessage(index, editingText);
      cancelEditing();
    }
  };

  const handleCopy = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = (text, index) => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${index + 1}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).length;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSpeak = (index, text) => {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get all available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Find the best natural-sounding voice
    // Priority: Google voices > Microsoft voices with "Natural" > Other high-quality voices
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') && voice.lang.startsWith('en')
    ) || voices.find(voice => 
      voice.name.includes('Natural') || voice.name.includes('neural')
    ) || voices.find(voice => 
      voice.lang.startsWith('en') && !voice.name.includes('eSpeak')
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Adjust parameters for more natural speech
    utterance.rate = 0.95;  // Slightly slower for clarity
    utterance.pitch = 1.0;  // Natural pitch
    utterance.volume = 1.0; // Full volume
    
    utterance.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex flex-col gap-4 ${getFontSizeClass()}`} ref={parent}>
      {Array.isArray(chat) && chat.filter(msg => msg !== null && msg !== undefined).map((message, i) => {
        const isEditing = editingIndex === i;
        const isUserMessage = message.sender === "user";

        // Search Match Logic
        const isMatch = searchQuery && message.message.toLowerCase().includes(searchQuery.toLowerCase());
        const isFirstMatch = searchQuery && chat.findIndex(m => m.message.toLowerCase().includes(searchQuery.toLowerCase())) === i;

        return (
          <div
            key={i}
            id={isFirstMatch ? "message-match-first" : undefined}
            className={`${isMatch ? "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] bg-yellow-900/10" : "border-[#999999]"} break-words border-2 rounded-xl self-end px-3 py-3 max-w-[80%] relative group ${
              message.sender === "ai" && aiStyle
            } ${
              message.sender === "user" ? "mr-[50px]" : ""
            } transition-all duration-300`}
            onDoubleClick={() => isUserMessage && startEditing(i, message.message)}
          >
            {/* Model Badge for AI */}
            {message.sender === "ai" && (
                <div className="absolute -top-3 left-3 bg-blue-600/90 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm z-10 border border-blue-400/30">
                    <Sparkles size={10} className="text-yellow-300" />
                    <span className="font-medium text-white/90">{message.model || "AI Model"}</span>
                </div>
            )}
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="bg-[#2A3441] text-white px-3 py-2 rounded outline-none resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => confirmEdit(i)}
                    className="text-green-500 hover:text-green-700 p-1"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Display attachments if present */}
                {message.images && message.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {message.images.map((file, index) => (
                      file.type?.startsWith('video/') ? (
                        <video
                          key={index}
                          src={file.data}
                          controls
                          className="max-w-full h-auto rounded-lg max-h-64 bg-black"
                        />
                      ) : (
                        <img
                          key={index}
                          src={file.data}
                          alt={file.name || `Image ${index + 1}`}
                          className="max-w-full h-auto rounded-lg max-h-64 object-contain"
                        />
                      )
                    ))}
                  </div>
                )}
                
                {message.sender === "ai" ? (
                  <MessageContent message={message.message} onRun={onRun} />
                ) : (
                  <MessageContent message={message.message} onRun={onRun} />
                )}

                {isUserMessage && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleCopy(i, message.message)}
                      className="text-gray-400 hover:text-white p-1 bg-[#1A232E] rounded"
                      title="Copy"
                    >
                      {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => startEditing(i, message.message)}
                      className="text-blue-400 hover:text-blue-600 p-1 bg-[#1A232E] rounded"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteMessage(i)}
                      className="text-red-400 hover:text-red-600 p-1 bg-[#1A232E] rounded"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    {/* Favorite Button for User */}
                     <button
                      onClick={() => onToggleFavorite && onToggleFavorite(i)}
                      className={`p-1 bg-[#1A232E] rounded transition-colors ${
                        favorites && favorites.some(f => f.messageIndex === i && f.chatId === (chat.id || localStorage.getItem("currentChatId"))) // Simple check, ideally pass full ID
                          ? "text-yellow-400" 
                          : "text-gray-400 hover:text-yellow-400"
                      }`}
                      title="Favorite"
                    >
                      <Star size={14} fill={favorites && favorites.some(f => f.messageIndex === i) ? "currentColor" : "none"} />
                    </button>
                  </div>
                )}
                {!isUserMessage && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                     <button
                      onClick={() => handleCopy(i, message.message)}
                      className="text-gray-400 hover:text-white p-1 bg-[#1A232E] rounded"
                      title="Copy"
                    >
                      {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleSpeak(i, message.message)}
                      className={`p-1 bg-[#1A232E] rounded transition-all ${
                        speakingIndex === i 
                          ? "text-green-400 animate-pulse ring-1 ring-green-500/50" 
                          : "text-gray-400 hover:text-white"
                      }`}
                      title={speakingIndex === i ? "Stop" : "Read Aloud"}
                    >
                      {speakingIndex === i ? <Square size={14} /> : <Volume2 size={14} />}
                    </button>
                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(message.message, i)}
                      className="text-gray-400 hover:text-white p-1 bg-[#1A232E] rounded"
                      title="Download as .md"
                    >
                      <Download size={14} />
                    </button>
                    {i === chat.length - 1 && onRegenerate && (
                      <button
                        onClick={onRegenerate}
                        className="text-gray-400 hover:text-white p-1 bg-[#1A232E] rounded"
                        title="Regenerate"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                     {/* Favorite Button for AI */}
                     <button
                      onClick={() => onToggleFavorite && onToggleFavorite(i)}
                      className={`p-1 bg-[#1A232E] rounded transition-colors ${
                        favorites && favorites.some(f => f.messageIndex === i) // Simplified check
                          ? "text-yellow-400" 
                          : "text-gray-400 hover:text-yellow-400"
                      }`}
                      title="Favorite"
                    >
                       <Star size={14} fill={favorites && favorites.some(f => f.messageIndex === i) ? "currentColor" : "none"} />
                    </button>
                  </div>
                )}

                {/* Message Footer Info (Timestamp & Stats) */}
                <div className={`mt-2 flex items-center gap-3 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                    <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(message.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                        <BarChart2 size={10} />
                        {getWordCount(message.message)} words
                    </span>
                    <span className="text-gray-600">
                        {message.message.length} chars
                    </span>
                </div>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          // Find the ChatPage's sendMessage function. 
                          // Since we don't have it passed directly, we might need to pass it or use a custom event.
                          // For now, let's assume we can pass a new prop 'onSuggestionClick'
                          if (onRun) onRun(suggestion, 'suggestion'); // Re-using onRun for now as a hack or better add new prop
                        }}
                        className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors border border-gray-700 text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      <div ref={bottomRef} className="h-3"></div>
    </div>
  );
};

export default ChatBody;
