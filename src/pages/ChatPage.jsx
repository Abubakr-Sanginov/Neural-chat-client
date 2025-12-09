import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatBody from "../components/ChatBody";
import ChatInput from "../components/ChatInput";
import ChatItem from "../components/ChatItem";

import TypingIndicator from "../components/TypingIndicator";
import StatsPanel from "../components/StatsPanel";
import { PERSONAS } from "../components/AIPersonas";
import QuickReplies from "../components/QuickReplies";
import {
  useKeyboardShortcuts,
  ShortcutsHelp,
} from "../components/KeyboardShortcuts";
import SettingsManager from "../components/SettingsManager";

import Templates from "../components/Templates";
import PinnedMessages from "../components/PinnedMessages";
import UnifiedComparison from "../components/UnifiedComparison";
import MarkdownEditor from "../components/MarkdownEditor";
import ScheduledMessages from "../components/ScheduledMessages";
import ChatShare from "../components/ChatShare";
import ChatExport from "../components/ChatExport";
import PythonSandbox from "../components/PythonSandbox";
import ThemeCustomizer from "../components/ThemeCustomizer";
import ConfirmationModal from "../components/ConfirmationModal";
import AIHabitat from "../components/AIHabitat";
import MiniAppsGenerator from "../components/MiniAppsGenerator";
import UserLearning from "../components/UserLearning";
import confetti from "canvas-confetti";


import {
  fetchStreamResponse,
  saveChat,
  getAllChats,
  loadChat,
  deleteChat,
  renameChat,
  generateChatTitle,
  getFolders,
  moveChatToFolder,
} from "../api";

import FolderList from "../components/FolderList";
import GlobalSearchModal from "../components/GlobalSearchModal";
import {
  Plus,
  Search,
  Settings,
  Square,
  Star,
  FileText,
  Columns,
  BarChart3,
  Sun,
  Moon,
  Monitor,
  Download,
  ArrowDown,
  ArrowUp,
  Maximize2,
  Minimize2,
  Timer,
  DownloadCloud,
  Eraser,
  Lock,
  Unlock,
  Menu,
  Edit,
  Clock,
  Share2,
  User,
  Code,
  Brain,
  Sparkles,
  Boxes,
  Palette,
  PlayCircle,
  Wand2,
  GraduationCap,
  X,
} from "lucide-react";

const MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite" },
];

export default function ChatPage() {
  const { chatId: urlChatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState([]);
  const [chatId, setChatId] = useState(() => {
    if (urlChatId) return urlChatId;
    const saved = localStorage.getItem("currentChatId");
    return saved || `chat_${Date.now()}`;
  });
  const [savedChats, setSavedChats] = useState([]);
  const [groupedChats, setGroupedChats] = useState({
    today: [],
    thisWeek: [],
    older: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  // Folders State
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null = all chats

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDeleteId, setChatToDeleteId] = useState(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [showSettings, setShowSettings] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(() => {
    return localStorage.getItem("systemInstruction") || "";
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  const [modelSettings, setModelSettings] = useState(() => {
    const saved = localStorage.getItem("modelSettings");
    return saved
      ? JSON.parse(saved)
      : { temperature: 1.0, topP: 0.95, topK: 64 };
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // New features state
  const [currentPersona, setCurrentPersona] = useState("default");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [customTemplates, setCustomTemplates] = useState(() => {
    const saved = localStorage.getItem("customTemplates");
    return saved ? JSON.parse(saved) : [];
  });
  const [pinnedMessages, setPinnedMessages] = useState(() => {
    const saved = localStorage.getItem("pinnedMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonChats, setComparisonChats] = useState({
    chat1: null,
    chat2: null,
  });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState([]);
  
  // New Features State
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(() => {
    const saved = localStorage.getItem("isAutoScrollEnabled");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("fontSize") || 'normal');
  const [chatSearchQuery, setChatSearchQuery] = useState(""); // Added
  const [showChatSearch, setShowChatSearch] = useState(false); // Added
  const [sessionTime, setSessionTime] = useState(0);
  const [isWideMode, setIsWideMode] = useState(false);
  const chatContainerRef = useRef(null);

  // Confetti Logic
  useEffect(() => {
    if (chat.length > 0) {
      const lastMsg = chat[chat.length - 1];
      if (lastMsg.sender === "ai") {
        const text = lastMsg.message.toLowerCase();
        // Trigger confetti for success/completion messages
        if (text.includes("task completed") || 
            text.includes("successfully generated") || 
            text.includes("all done") ||
            (text.includes("success") && text.length < 100)) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    }
  }, [chat]);

  // Session Timer
  useEffect(() => {
    const timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSessionTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Scroll Button Logic
  useEffect(() => {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;
    
    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        // Show button if we are more than 300px away from bottom
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
        setShowScrollButton(!isNearBottom);
        
        // Show Top button if we are scrolled down more than 300px
        setShowScrollTopButton(scrollTop > 300);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    const container = document.getElementById('chat-messages-container');
    if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    const container = document.getElementById('chat-messages-container');
    if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearChat = async () => {
    if (confirm("Вы уверены, что хотите очистить историю этого чата? Сам чат не удалится.")) {
      setChat([]);
      try {
        await saveChat(chatId, [], "New Chat");
        await loadChatsList();
      } catch (e) {
        console.error("Failed to clear chat", e);
      }
    }
  };

  // New modals state
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [showScheduledMessages, setShowScheduledMessages] = useState(false);
  const [showChatShare, setShowChatShare] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxCode, setSandboxCode] = useState("");
  const [showAIHabitat, setShowAIHabitat] = useState(false);
  const [showMiniApps, setShowMiniApps] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showUserLearning, setShowUserLearning] = useState(false);
  const [currentAIClone, setCurrentAIClone] = useState(null);
  const [chatTags, setChatTags] = useState(() => {
    const saved = localStorage.getItem("chatTags");
    return saved ? JSON.parse(saved) : {};
  });
  const [favoriteChats, setFavoriteChats] = useState(() => {
    const saved = localStorage.getItem("favoriteChats");
    return saved ? JSON.parse(saved) : [];
  });

  // Mobile responsive state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("stats");
    return saved
      ? JSON.parse(saved)
      : {
          totalMessages: 0,
          totalTokens: 0,
          totalChats: 0,
          avgResponseTime: 0,
          weeklyUsage: [],
        };
  });

  // Draft messages state
  const [draftMessages, setDraftMessages] = useState(() => {
    const saved = localStorage.getItem("draftMessages");
    return saved ? JSON.parse(saved) : {};
  });

  const abortControllerRef = useRef(null);

  // Save custom templates
  useEffect(() => {
    localStorage.setItem("customTemplates", JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Save pinned messages
  useEffect(() => {
    localStorage.setItem("pinnedMessages", JSON.stringify(pinnedMessages));
  }, [pinnedMessages]);

  useEffect(() => {
    localStorage.setItem("systemInstruction", systemInstruction);
  }, [systemInstruction]);

  // Load chats list on mount
  useEffect(() => {
    loadChatsList();
  }, []);

  // Load chat from URL on mount or when URL changes
  useEffect(() => {
    if (urlChatId) {
      loadChat(urlChatId)
        .then((data) => {
          setChat(data.messages || []);
          setChatId(urlChatId);
        })
        .catch((error) => {
          console.error("Failed to load chat from URL:", error);
          // If chat doesn't exist, just set empty chat
          setChat([]);
          setChatId(urlChatId);
        });
    }
  }, [urlChatId]);

  // Update URL when chatId changes (but not from URL)
  useEffect(() => {
    if (chatId && !urlChatId) {
      navigate(`/chat/${chatId}`, { replace: true });
    }
  }, [chatId, navigate, urlChatId]);

  // Auto-save chat when it changes
  useEffect(() => {
    if (chat.length > 0) {
      const timer = setTimeout(() => {
        const title =
          chat.length > 0
            ? chat[0].message.slice(0, 50) +
              (chat[0].message.length > 50 ? "..." : "")
            : "New Chat";
        console.log(
          "🔄 Auto-saving chat...",
          JSON.stringify({ chatId, title, messageCount: chat.length })
        );
        saveChat(chatId, chat, title)
          .then((response) => {
            console.log(
              "✅ Chat saved successfully:",
              JSON.stringify(response)
            );
            // Removed loadChatsList() to prevent loading state while typing
          })
          .catch((error) => {
            console.error("❌ Failed to auto-save chat:", error);
            if (error.response) {
              console.error("Error response:", error.response);
            }
          });
      }, 2000); // Save 2 seconds after last change
      return () => clearTimeout(timer);
    }
  }, [chat, chatId]);

  // Save current chat ID to localStorage
  useEffect(() => {
    localStorage.setItem("currentChatId", chatId);
  }, [chatId]);

  // Save theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Save model settings
  useEffect(() => {
    localStorage.setItem("modelSettings", JSON.stringify(modelSettings));
  }, [modelSettings]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Save chat tags
  useEffect(() => {
    localStorage.setItem("chatTags", JSON.stringify(chatTags));
  }, [chatTags]);

  // Save favorite chats
  useEffect(() => {
    localStorage.setItem("favoriteChats", JSON.stringify(favoriteChats));
  }, [favoriteChats]);

  // Save stats
  useEffect(() => {
    localStorage.setItem("stats", JSON.stringify(stats));
  }, [stats]);

  // Save draft messages
  useEffect(() => {
    localStorage.setItem("draftMessages", JSON.stringify(draftMessages));
  }, [draftMessages]);

  useEffect(() => {
    localStorage.setItem("isAutoScrollEnabled", JSON.stringify(isAutoScrollEnabled));
  }, [isAutoScrollEnabled]);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // Update system instruction when persona changes
  useEffect(() => {
    const persona = PERSONAS.find((p) => p.id === currentPersona);
    if (persona) {
      setSystemInstruction(persona.instruction);
    }
  }, [currentPersona]);

  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data);
    } catch (error) {
      console.error("Failed to load folders", error);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const loadChatsList = async () => {
    setIsLoading(true);
    try {
      const chats = await getAllChats();
      if (Array.isArray(chats)) {
        // Group chats by time period
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const grouped = {
          today: [],
          thisWeek: [],
          older: [],
        };

        chats.forEach((chat) => {
          const chatDate = new Date(chat.updatedAt);
          if (chatDate >= today) {
            grouped.today.push(chat);
          } else if (chatDate >= weekAgo) {
            grouped.thisWeek.push(chat);
          } else {
            grouped.older.push(chat);
          }
        });

        setSavedChats(chats);
        setGroupedChats(grouped);
      } else {
        setSavedChats([]);
        setGroupedChats({ today: [], thisWeek: [], older: [] });
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
      setSavedChats([]);
      setGroupedChats({ today: [], thisWeek: [], older: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChat = async () => {
    try {
      const title =
        chat.length > 0
          ? chat[0].message.slice(0, 50) +
            (chat[0].message.length > 50 ? "..." : "")
          : "New Chat";
      await saveChat(chatId, chat, title);
      await loadChatsList();
    } catch (error) {
      console.error("Failed to save chat:", error);
    }
  };

  const handleLoadChat = async (id) => {
    try {
      const data = await loadChat(id);
      setChat(data.messages);
      setChatId(id);
      navigate(`/chat/${id}`);
      setIsMobileSidebarOpen(false); // Close mobile sidebar after selecting chat
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  const handleNewChat = () => {
    const newId = `chat_${Date.now()}`;
    setChatId(newId);
    setChat([]);
    navigate(`/chat/${newId}`);
    setIsMobileSidebarOpen(false); // Close mobile sidebar after creating new chat
  };

  const handleDeleteChat = (id) => {
    setChatToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDeleteId) return;

    try {
      await deleteChat(chatToDeleteId);

      // Remove from favorites if it exists
      if (favoriteChats.includes(chatToDeleteId)) {
        setFavoriteChats((prev) =>
          prev.filter((chatId) => chatId !== chatToDeleteId)
        );
      }

      await loadChatsList();
      if (chatToDeleteId === chatId) {
        const newId = `chat_${Date.now()}`;
        setChatId(newId);
        setChat([]);
        navigate(`/chat/${newId}`);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setShowDeleteConfirm(false);
      setChatToDeleteId(null);
    }
  };

  const handleRenameChat = async (id, newTitle) => {
    try {
      await renameChat(id, newTitle);
      await loadChatsList();
      setEditingChatId(null);
    } catch (error) {
      console.error("Failed to rename chat:", error);
    }
  };

  const startEditing = (id, currentTitle) => {
    setEditingChatId(id);
    setEditingTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  // Group chats by date
  const groupChatsByDate = (chats) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt);
      const chatDay = new Date(
        chatDate.getFullYear(),
        chatDate.getMonth(),
        chatDate.getDate()
      );

      if (chatDay.getTime() === today.getTime()) {
        groups.today.push(chat);
      } else if (chatDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  // Filter chats by search query
  const filteredChats = savedChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendMessage = async (message) => {
    setChat((prev) => [...prev, message]);
    setIsLoading(true);

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalMessages: prev.totalMessages + 1,
    }));

    // Create new AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Add empty AI message that will be filled with streaming
    const aiMessageIndex = chat.length + 1;
    setChat((prev) => [...prev, { sender: "ai", message: "" }]);

    try {
      let fullMessage = "";
      await fetchStreamResponse(
        chat.concat([message]),
        selectedModel,
        systemInstruction,
        modelSettings, // Pass model settings to API
        (chunk) => {
          // Ensure chunk is a string
          const chunkText =
            typeof chunk === "string" ? chunk : JSON.stringify(chunk);
          fullMessage += chunkText;
          setChat((prev) => {
            const newChat = [...prev];
            newChat[aiMessageIndex] = { sender: "ai", message: fullMessage };
            return newChat;
          });
        },
        abortControllerRef.current.signal,
        message.useWebSearch || false // Pass web search flag
      );

      setStats((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        totalTokens: prev.totalTokens + fullMessage.length / 4, // Approx
      }));

      // Auto-Title Generation
      // If this is the first exchange (user message + AI response), generate a title
      if (chat.length === 0) {
        try {
          // Generate title asynchronously
          generateChatTitle(chat.concat([message]), selectedModel).then(
            async (generatedTitle) => {
              if (generatedTitle) {
                // Update local state if needed, but mainly save to server
                await saveChat(
                  chatId,
                  chat.concat([
                    message,
                    { sender: "ai", message: fullMessage },
                  ]),
                  generatedTitle
                );
                await loadChatsList();
              }
            }
          );
        } catch (e) {
          console.error("Auto-title failed", e);
        }
      }

      // Generate Follow-up Suggestions
      try {
        // Only generate if not a battle mode (simple check)
        if (!showComparison) {
          // We use a separate non-streaming call or a lightweight model for this
          const suggestionPrompt = `Based on the previous conversation, suggest 3 short, relevant follow-up questions the user might want to ask. Output ONLY the questions, one per line. Do not number them.`;

          fetchStreamResponse(
            [
              {
                role: "user",
                parts: [
                  {
                    text: `Context: User asked "${message.message}". AI answered "${fullMessage}". ${suggestionPrompt}`,
                  },
                ],
              },
            ],
            selectedModel,
            "You are a helpful assistant.",
            { temperature: 0.7 },
            (chunk) => {}, // We don't stream this to UI directly
            null
          ).then(() => {
            // Since we reused fetchStreamResponse which is void, we actually need a way to get the text.
            // Let's use a new helper or just reuse the existing pattern but capture the output.
            // Actually, let's just do a quick fetch to the stream endpoint and capture it manually
            // or better yet, add a helper in api.js.
            // For now, let's implement a simple fetch here to avoid modifying api.js too much if possible,
            // or just use the existing generateChatTitle pattern which captures text.
          });

          // Let's use a direct fetch here for simplicity as we did with title generation
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:3080"}/stream`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: `Context: User asked "${message.message}". AI answered "${fullMessage}". ${suggestionPrompt}`,
                      },
                    ],
                  },
                ],
                model: selectedModel,
                systemInstruction: "You are a helpful assistant.",
                modelSettings: { temperature: 0.7 },
              }),
            }
          );

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let suggestionsText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.chunk) suggestionsText += parsed.chunk;
                } catch (e) {}
              }
            }
          }

          const suggestions = suggestionsText
            .split("\n")
            .filter((s) => s.trim().length > 0)
            .slice(0, 3);

          setChat((prev) => {
            const newChat = [...prev];
            // Attach suggestions to the last AI message
            if (newChat[aiMessageIndex]) {
              newChat[aiMessageIndex] = {
                ...newChat[aiMessageIndex],
                suggestions: suggestions,
              };
            }
            return newChat;
          });
        }
      } catch (e) {
        console.error("Failed to generate suggestions", e);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Generation stopped by user");
      } else {
        console.error("Streaming failed:", error);
        setChat((prev) => {
          const newChat = [...prev];
          newChat[aiMessageIndex] = {
            sender: "ai",
            message: "Error: Failed to get response",
          };
          return newChat;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = async (index, newText) => {
    // Update the message
    const updatedChat = [...chat];
    updatedChat[index] = { ...updatedChat[index], message: newText };

    // Remove AI response if it exists (next message after user message)
    if (index + 1 < chat.length && chat[index + 1].sender === "ai") {
      updatedChat.splice(index + 1, 1);
    }

    setChat(updatedChat.slice(0, index + 1));
    setIsLoading(true);

    // Create new AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Add empty AI message for regeneration
    const aiMessageIndex = index + 1;
    setChat((prev) => [...prev, { sender: "ai", message: "" }]);

    try {
      let fullMessage = "";
      const contextChat = updatedChat.slice(0, index + 1);
      await fetchStreamResponse(
        contextChat,
        selectedModel,
        systemInstruction,
        modelSettings, // Pass model settings
        (chunk) => {
          fullMessage += chunk;
          setChat((prev) => {
            const newChat = [...prev];
            newChat[aiMessageIndex] = { sender: "ai", message: fullMessage };
            return newChat;
          });
        },
        abortControllerRef.current.signal
      );

      // Save after regeneration completes
      const finalChat = updatedChat
        .slice(0, index + 1)
        .concat([{ sender: "ai", message: fullMessage }]);

      const existingChat = savedChats.find((c) => c.id === chatId);
      const title = existingChat
        ? existingChat.title
        : finalChat.length > 0
        ? finalChat[0].message.slice(0, 50) +
          (finalChat[0].message.length > 50 ? "..." : "")
        : "New Chat";

      await saveChat(chatId, finalChat, title);
      await loadChatsList();
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Regeneration stopped by user");
      } else {
        console.error("Regeneration failed:", error);
        setChat((prev) => {
          const newChat = [...prev];
          newChat[aiMessageIndex] = {
            sender: "ai",
            message: "Error: Failed to regenerate response",
          };
          return newChat;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = async () => {
    if (chat.length === 0) return;

    let updatedChat = [...chat];
    if (updatedChat[updatedChat.length - 1].sender === "ai") {
      updatedChat.pop();
    }

    if (
      updatedChat.length === 0 ||
      updatedChat[updatedChat.length - 1].sender !== "user"
    )
      return;

    setChat(updatedChat);
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const aiMessageIndex = updatedChat.length;
    setChat((prev) => [...prev, { sender: "ai", message: "" }]);

    try {
      let fullMessage = "";
      await fetchStreamResponse(
        updatedChat,
        selectedModel,
        systemInstruction,
        modelSettings,
        (chunk) => {
          fullMessage += chunk;
          setChat((prev) => {
            const newChat = [...prev];
            newChat[aiMessageIndex] = { sender: "ai", message: fullMessage };
            return newChat;
          });
        },
        abortControllerRef.current.signal
      );

      setStats((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        totalTokens: prev.totalTokens + fullMessage.length / 4,
      }));

      // Save chat
      const finalChat = updatedChat.concat([
        { sender: "ai", message: fullMessage },
      ]);

      const existingChat = savedChats.find((c) => c.id === chatId);
      const title = existingChat
        ? existingChat.title
        : finalChat[0].message.slice(0, 50) +
          (finalChat[0].message.length > 50 ? "..." : "");

      await saveChat(chatId, finalChat, title);
      await loadChatsList();
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Regeneration stopped by user");
      } else {
        console.error("Regeneration failed:", error);
        setChat((prev) => {
          const newChat = [...prev];
          newChat[aiMessageIndex] = {
            sender: "ai",
            message: "Error: Failed to regenerate response",
          };
          return newChat;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (index) => {
    const updatedChat = [...chat];

    // Remove the user message
    updatedChat.splice(index, 1);

    // If there's an AI response right after, remove it too
    if (index < updatedChat.length && updatedChat[index].sender === "ai") {
      updatedChat.splice(index, 1);
    }

    setChat(updatedChat);

    // Save immediately to server
    try {
      const existingChat = savedChats.find((c) => c.id === chatId);
      const title = existingChat
        ? existingChat.title
        : updatedChat.length > 0
        ? updatedChat[0].message.slice(0, 50) +
          (updatedChat[0].message.length > 50 ? "..." : "")
        : "New Chat";
      await saveChat(chatId, updatedChat, title);
      await loadChatsList();
    } catch (error) {
      console.error("Failed to save after delete:", error);
    }
  };

  // Toggle favorite status for a chat
  const toggleFavoriteChat = (chatIdToToggle) => {
    setFavoriteChats((prev) => {
      if (prev.includes(chatIdToToggle)) {
        return prev.filter((id) => id !== chatIdToToggle);
      } else {
        return [...prev, chatIdToToggle];
      }
    });
  };

  // Keyboard shortcuts handler - defined after all handler functions
  useKeyboardShortcuts({
    search: () => {
      setShowGlobalSearch(true);
    },
    newChat: handleNewChat,
    commands: () => setShowShortcutsHelp(true),
    save: handleSaveChat,
    export: () => setShowSettings(true),
    close: () => {
      setShowSettings(false);
      setShowStatsPanel(false);
      setShowShortcutsHelp(false);
      setEditingChatId(null);
    },
    send: () => {
      // Handled in ChatInput component
    },
  });

  const handleMoveToFolder = async (chatId, folderId) => {
    try {
      await moveChatToFolder(chatId, folderId);
      await loadChatsList();
    } catch (error) {
      console.error("Failed to move chat to folder", error);
    }
  };

  return (
    <div className="bg-[#1A232E] h-screen text-white overflow-hidden flex">
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive drawer on mobile */}
      {!isFocusMode && (
        <aside
          className={`
          bg-[#0F1419] w-80 flex flex-col border-r border-gray-700 shadow-xl
          fixed md:relative h-full z-50
          transition-transform duration-300 ease-in-out
          ${
            isMobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
        >
          <div className="p-4 flex flex-col h-full">
          {/* Icon Controls - Grid Layout */}
          <div className="grid grid-cols-4 gap-2 mb-4 px-1">


            {/* Favorites Button */}
            <button
              onClick={() => navigate("/favorites")}
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-all duration-200 group relative"
              title="Избранные чаты"
            >
              <Star
                size={20}
                className="text-gray-400 group-hover:text-yellow-400 transition-colors"
              />
              {favoriteChats.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {favoriteChats.length}
                </span>
              )}
            </button>

            {/* Stats Button */}
            <button
              onClick={() => setShowStatsPanel(true)}
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-all duration-200 group"
              title="Статистика"
            >
              <BarChart3
                size={20}
                className="text-gray-400 group-hover:text-purple-400 transition-colors"
              />
            </button>

            {/* Compare Button */}
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedChatIds([]);
              }}
              className={`p-2.5 rounded-lg transition-all duration-200 group ${
                isSelectionMode
                  ? "bg-blue-600/20 text-blue-400"
                  : "hover:bg-gray-800 text-gray-400 hover:text-blue-400"
              }`}
              title={isSelectionMode ? "Отменить сравнение" : "Сравнить чаты"}
            >
              <Columns size={20} />
            </button>



            {/* Theme Toggle */}
            <button
              onClick={() => {
                const themes = ["dark", "light", "auto"];
                const currentIndex = themes.indexOf(theme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                setTheme(nextTheme);
              }}
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-all duration-200 group"
              title={`Theme: ${theme}`}
            >
              {theme === "light" ? (
                <Sun
                  size={20}
                  className="text-gray-400 group-hover:text-yellow-400 transition-colors"
                />
              ) : theme === "dark" ? (
                <Moon
                  size={20}
                  className="text-gray-400 group-hover:text-blue-400 transition-colors"
                />
              ) : (
                <Monitor
                  size={20}
                  className="text-gray-400 group-hover:text-green-400 transition-colors"
                />
              )}
            </button>

            {/* Theme Customizer */}
            <button
              onClick={() => setShowThemeCustomizer(true)}
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-all duration-200 group"
              title="Theme Customizer"
            >
              <Palette
                size={20}
                className="text-gray-400 group-hover:text-pink-400 transition-colors"
              />
            </button>

            {/* API Playground */}
            <button
              onClick={() => navigate("/playground")}
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-all duration-200 group"
              title="API Playground"
            >
              <PlayCircle
                size={20}
                className="text-gray-400 group-hover:text-green-400 transition-colors"
              />
            </button>



            {/* User Learning */}
            <button
              onClick={() => setShowUserLearning(true)}
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-all duration-200 group"
              title="User Learning - Анализ"
            >
              <GraduationCap
                size={20}
                className="text-gray-400 group-hover:text-emerald-400 transition-colors"
              />
            </button>

            {/* Proxy Downloader */}
            <button
              onClick={() => navigate("/downloader")}
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-all duration-200 group"
              title="Proxy Downloader"
            >
              <DownloadCloud
                size={20}
                className="text-gray-400 group-hover:text-cyan-400 transition-colors"
              />
            </button>
          </div>
          
          {/* Session Info & Toggles */}
          <div className="flex items-center justify-between px-3 mb-4 text-xs text-gray-500 bg-gray-800/30 py-2 rounded-lg mx-3">
            <div className="flex items-center gap-1.5" title="Session Duration">
                <Timer size={12} className={sessionTime > 3600 ? "text-orange-400" : "text-blue-400"} />
                <span className="font-mono">{formatSessionTime(sessionTime)}</span>
            </div>
            <button 
                onClick={() => setIsWideMode(!isWideMode)}
                className={`p-1 rounded hover:bg-gray-700 transition-colors ${isWideMode ? "text-blue-400" : "text-gray-500"}`}
                title={isWideMode ? "Default Width" : "Wide Mode"}
            >
                {isWideMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Поиск чатов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1A232E] pl-10 pr-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-800 placeholder-gray-500"
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg mb-6 flex items-center justify-center gap-2 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            New Chat
          </button>

          {/* Compare Mode Helper */}
          {isSelectionMode && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-2">
                Выберите 2 чата для сравнения ({selectedChatIds.length}/2)
              </p>
              {selectedChatIds.length === 2 && (
                <button
                  onClick={async () => {
                    const chat1Data = await loadChat(selectedChatIds[0]);
                    const chat2Data = await loadChat(selectedChatIds[1]);
                    const chat1Info = savedChats.find(
                      (c) => c.id === selectedChatIds[0]
                    );
                    const chat2Info = savedChats.find(
                      (c) => c.id === selectedChatIds[1]
                    );
                    setComparisonChats({
                      chat1: {
                        messages: chat1Data.messages,
                        title: chat1Info?.title || "Chat 1",
                      },
                      chat2: {
                        messages: chat2Data.messages,
                        title: chat2Info?.title || "Chat 2",
                      },
                    });
                    setShowComparison(true);
                    setIsSelectionMode(false);
                    setSelectedChatIds([]);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors"
                >
                  Начать сравнение
                </button>
              )}
            </div>
          )}

          {/* Folder List */}
          <FolderList 
            folders={folders} 
            onFolderSelect={(id) => setSelectedFolderId(selectedFolderId === id ? null : id)}
            onFolderUpdate={loadFolders}
            selectedFolderId={selectedFolderId}
          />

          {/* Chat List - Beautiful Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
            {isLoading ? (
              <div className="text-center text-gray-500 mt-8">
                Loading chats...
              </div>
            ) : (
              <>
                {groupedChats.today.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2 uppercase tracking-wider">
                      Сегодня
                    </h3>
                    {groupedChats.today.map((savedChat) => (
                      <ChatItem
                        key={savedChat.id}
                        savedChat={savedChat}
                        chatId={chatId}
                        editingChatId={editingChatId}
                        editingTitle={editingTitle}
                        setEditingTitle={setEditingTitle}
                        handleLoadChat={handleLoadChat}
                        handleRenameChat={handleRenameChat}
                        startEditing={startEditing}
                        cancelEditing={cancelEditing}
                        handleDeleteChat={handleDeleteChat}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedChatIds.includes(savedChat.id)}
                        onToggleSelect={(id) => {
                          setSelectedChatIds((prev) => {
                            if (prev.includes(id)) {
                              return prev.filter((chatId) => chatId !== id);
                            } else if (prev.length < 2) {
                              return [...prev, id];
                            }
                            return prev;
                          });
                        }}
                        isFavorite={favoriteChats.includes(savedChat.id)}
                        onToggleFavorite={toggleFavoriteChat}
                        folders={folders}
                        onMoveToFolder={handleMoveToFolder}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.thisWeek && groupedChats.thisWeek.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2 uppercase tracking-wider">
                      На этой неделе
                    </h3>
                    {groupedChats.thisWeek.map((savedChat) => (
                      <ChatItem
                        key={savedChat.id}
                        savedChat={savedChat}
                        chatId={chatId}
                        editingChatId={editingChatId}
                        editingTitle={editingTitle}
                        setEditingTitle={setEditingTitle}
                        handleLoadChat={handleLoadChat}
                        handleRenameChat={handleRenameChat}
                        startEditing={startEditing}
                        cancelEditing={cancelEditing}
                        handleDeleteChat={handleDeleteChat}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedChatIds.includes(savedChat.id)}
                        onToggleSelect={(id) => {
                          setSelectedChatIds((prev) => {
                            if (prev.includes(id)) {
                              return prev.filter((chatId) => chatId !== id);
                            } else if (prev.length < 2) {
                              return [...prev, id];
                            }
                            return prev;
                          });
                        }}
                        isFavorite={favoriteChats.includes(savedChat.id)}
                        onToggleFavorite={toggleFavoriteChat}
                        folders={folders}
                        onMoveToFolder={handleMoveToFolder}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.older.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2 uppercase tracking-wider">
                      Старые
                    </h3>
                    {groupedChats.older.map((savedChat) => (
                      <ChatItem
                        key={savedChat.id}
                        savedChat={savedChat}
                        chatId={chatId}
                        editingChatId={editingChatId}
                        editingTitle={editingTitle}
                        setEditingTitle={setEditingTitle}
                        handleLoadChat={handleLoadChat}
                        handleRenameChat={handleRenameChat}
                        startEditing={startEditing}
                        cancelEditing={cancelEditing}
                        handleDeleteChat={handleDeleteChat}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedChatIds.includes(savedChat.id)}
                        onToggleSelect={(id) => {
                          setSelectedChatIds((prev) => {
                            if (prev.includes(id)) {
                              return prev.filter((chatId) => chatId !== id);
                            } else if (prev.length < 2) {
                              return [...prev, id];
                            }
                            return prev;
                          });
                        }}
                        isFavorite={favoriteChats.includes(savedChat.id)}
                        onToggleFavorite={toggleFavoriteChat}
                        folders={folders}
                        onMoveToFolder={handleMoveToFolder}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Toolbar - Pinned to bottom */}
          <div className="p-4 border-t border-gray-800 bg-[#0F1419] mt-auto">
            <div className="flex items-center gap-2 pt-2 border-t border-gray-800/50">
              <button
                onClick={() => navigate("/profile")}
                className="flex-1 flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors text-sm text-gray-300 hover:text-white"
              >
                <User size={18} />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Settings"
              >
                <Settings size={18} />
              </button>

              <button
                onClick={handleClearChat}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                title="Clear Chat Context"
              >
                <Eraser size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${isFocusMode ? "items-center bg-[#1A232E]" : ""}`}>
        {/* Mobile Hamburger Menu */}
        {!isFocusMode && (
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-30 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Exit Focus Mode Button */}
        {isFocusMode && (
          <button
            onClick={() => setIsFocusMode(false)}
            className="fixed top-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <Boxes size={18} />
            Exit Focus
          </button>
        )}

        {/* Chat Header */}
        {!isFocusMode && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#1A232E]/95 backdrop-blur z-20 sticky top-0">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold text-white truncate max-w-[200px] md:max-w-md" title={savedChats.find(c => c.id === chatId)?.title || "Chat"}>
                        {savedChats.find(c => c.id === chatId)?.title || "New Chat"}
                    </h2>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(savedChats.find(c => c.id === chatId)?.timestamp || Date.now()).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                 {/* Search Toggle */}
                 <button
                    onClick={() => {
                        setShowChatSearch(!showChatSearch);
                        if(showChatSearch) setChatSearchQuery(""); 
                    }}
                    className={`p-2 rounded-lg transition-colors ${showChatSearch ? "bg-blue-600/20 text-blue-400" : "hover:bg-gray-800 text-gray-400"}`}
                    title="Search in Chat"
                 >
                    <Search size={18} />
                 </button>

                 {/* Export */}
                 <ChatExport 
                    chat={chat} 
                    chatId={chatId} 
                    title={savedChats.find(c => c.id === chatId)?.title || "Export"} 
                 />

                 {/* Clear Button (Moved from sidebar) */}
                 <button
                    onClick={handleClearChat}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    title="Clear Chat Context"
                  >
                    <Eraser size={18} />
                  </button>
            </div>
          </div>
        )}
        
        {/* In-Chat Search Bar */}
        {showChatSearch && (
            <div className="px-6 py-2 bg-[#151b23] border-b border-gray-800 flex items-center gap-2 animate-slide-down">
                <Search size={16} className="text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Find in conversation..." 
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-sm text-white focus:ring-0 flex-1 placeholder-gray-600"
                    autoFocus
                />
                <button onClick={() => { setShowChatSearch(false); setChatSearchQuery(""); }} className="text-gray-500 hover:text-white">
                    <X size={16} />
                </button>
            </div>
        )}

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <PinnedMessages
            pinnedMessages={pinnedMessages}
            onUnpin={(id) => {
              setPinnedMessages((prev) => prev.filter((msg) => msg.id !== id));
            }}
            onNavigate={(messageIndex) => {
              // Scroll to message implementation
              console.log("Navigate to message", messageIndex);
            }}
          />
        )}

        <div
          id="chat-messages-container"
          className={`flex-1 overflow-y-auto px-4 pt-[50px] ${isFocusMode || isWideMode ? "w-full max-w-none px-8" : "w-full max-w-3xl"}`}
        >
          <ChatBody
            chat={chat}
            fontSize={fontSize}
            isAutoScrollEnabled={isAutoScrollEnabled}
            searchQuery={chatSearchQuery} // Added prop
            onEditMessage={handleEditMessage}
            onRun={(code, language) => {
              if (language === "suggestion") {
                sendMessage({ sender: "user", message: code });
              } else if (language === "python" || language === "py") {
                setSandboxCode(code);
                setShowSandbox(true);
              } else {
                // Existing run code logic (if any)
                console.log("Run code:", code, language);
              }
            }}
            onDeleteMessage={handleDeleteMessage}
            onRegenerate={handleRegenerate}
            favorites={favorites}
            onToggleFavorite={(index) => {
              setFavorites((prev) => {
                const messageId = `${chatId}-${index}`;
                if (prev.some((f) => f.id === messageId)) {
                  return prev.filter((f) => f.id !== messageId);
                } else {
                  return [
                    ...prev,
                    {
                      id: messageId,
                      chatId,
                      messageIndex: index,
                      message: chat[index].message,
                      timestamp: Date.now(),
                    },
                  ];
                }
              });
            }}
            pinnedMessages={pinnedMessages}
            onPinMessage={(index) => {
              const messageId = `${chatId}-${index}`;
              if (!pinnedMessages.some((p) => p.id === messageId)) {
                setPinnedMessages((prev) => [
                  ...prev,
                  {
                    id: messageId,
                    chatId,
                    messageIndex: index,
                    message: chat[index].message,
                    sender: chat[index].sender,
                    timestamp: Date.now(),
                  },
                ]);
              }
            }}
          />

          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}
        </div>

        {/* Quick Replies */}
        {showQuickReplies && (
          <div className="px-4">
            <QuickReplies
              onSelectReply={(reply) => {
                sendMessage({ sender: "user", message: reply });
                setShowQuickReplies(false);
              }}
            />
          </div>
        )}

        {/* Chat Input */}
        <div className={`border-t border-gray-700 bg-[#1A232E] px-4 py-3 ${isFocusMode ? "w-full max-w-3xl border-x border-gray-800 rounded-t-xl" : "w-full"}`}>
          {/* Stop Generation Button */}
          {isLoading && (
            <div className="flex justify-center mb-2">
              <button
                onClick={stopGeneration}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
              >
                <Square size={16} />
                Остановить генерацию
              </button>
            </div>
          )}

          <ChatInput
            sendMessage={sendMessage}
            loading={isLoading}
            onToggleQuickReplies={() => setShowQuickReplies(!showQuickReplies)}
          />
        </div>
        
        {/* Scroll To Bottom Button */}
        {showScrollButton && (
            <button
                onClick={scrollToBottom}
                className="absolute bottom-24 right-8 bg-blue-600/80 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all z-20 animate-bounce-short"
            >
                <ArrowDown size={20} />
            </button>
        )}

        {/* Scroll To Top Button */}
        {showScrollTopButton && (
            <button
                onClick={scrollToTop}
                className="absolute top-20 right-8 bg-gray-700/80 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all z-20"
                title="Scroll to Top"
            >
                <ArrowUp size={20} />
            </button>
        )}

        {/* Auto Scroll Toggle */}
        <button
            onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
            className={`absolute bottom-36 right-8 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all z-20 ${
              isAutoScrollEnabled ? 'bg-green-600/80 hover:bg-green-600 text-white' : 'bg-gray-700/80 hover:bg-gray-600 text-gray-400'
            }`}
            title={isAutoScrollEnabled ? "Auto-scroll ON" : "Auto-scroll OFF"}
        >
            {isAutoScrollEnabled ? <Unlock size={20} /> : <Lock size={20} />}
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsManager
          systemInstruction={systemInstruction}
          onSystemInstructionChange={setSystemInstruction}
          modelSettings={modelSettings}
          onModelSettingsChange={setModelSettings}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onClose={() => setShowSettings(false)}
          currentPersona={currentPersona}
          onPersonaChange={setCurrentPersona}
        />
      )}

      {/* Stats Panel */}
      <StatsPanel
        stats={stats}
        isOpen={showStatsPanel}
        onClose={() => setShowStatsPanel(false)}
      />

      {/* Shortcuts Help */}
      {showShortcutsHelp && (
        <ShortcutsHelp onClose={() => setShowShortcutsHelp(false)} />
      )}

      {/* Templates */}
      {showTemplates && (
        <Templates
          templates={customTemplates}
          onSelectTemplate={(template) => {
            if (template.messages && template.messages.length > 0) {
              sendMessage(template.messages[0]);
            }
            setShowTemplates(false);
          }}
          onCreateTemplate={(template) => {
            setCustomTemplates((prev) => [...prev, template]);
          }}
          onDeleteTemplate={(templateId) => {
            setCustomTemplates((prev) =>
              prev.filter((t) => t.id !== templateId)
            );
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Unified Comparison (Chat Comparison + AI Battle) */}
      {showComparison && comparisonChats.chat1 && comparisonChats.chat2 && (
        <UnifiedComparison
          // Compare Mode props
          chat1={comparisonChats.chat1.messages}
          chat2={comparisonChats.chat2.messages}
          chat1Title={comparisonChats.chat1.title}
          chat2Title={comparisonChats.chat2.title}
          // Battle Mode props
          systemInstruction={systemInstruction}
          modelSettings={modelSettings}
          // Common props
          isOpen={showComparison}
          onClose={() => {
            setShowComparison(false);
            setComparisonChats({ chat1: null, chat2: null });
          }}
          initialMode="compare"
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteChat}
        title="Удалить чат?"
        message="Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить."
      />

      {/* Markdown Editor */}
      {showMarkdownEditor && (
        <MarkdownEditor
          isOpen={showMarkdownEditor}
          onClose={() => setShowMarkdownEditor(false)}
          onInsert={(text) => {
            console.log("Markdown text:", text);
            setShowMarkdownEditor(false);
          }}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onNavigateToChat={handleLoadChat}
      />



      {/* Scheduled Messages */}
      {showScheduledMessages && (
        <ScheduledMessages
          isOpen={showScheduledMessages}
          onClose={() => setShowScheduledMessages(false)}
          onSchedule={(msg) => sendMessage({ sender: "user", message: msg })}
        />
      )}

      {/* Chat Share */}
      {showChatShare && (
        <ChatShare
          isOpen={showChatShare}
          onClose={() => setShowChatShare(false)}
          chatId={chatId}
          chatTitle={savedChats.find((c) => c.id === chatId)?.title || "Chat"}
          chat={chat}
        />
      )}

      {/* Theme Customizer */}
      {showThemeCustomizer && (
        <ThemeCustomizer
          isOpen={showThemeCustomizer}
          onClose={() => setShowThemeCustomizer(false)}
        />
      )}

      {/* Python Sandbox */}
      {showSandbox && (
        <PythonSandbox
          initialCode={sandboxCode}
          onClose={() => setShowSandbox(false)}
        />
      )}

      {/* AI Habitat */}
      {showAIHabitat && (
        <AIHabitat
          isOpen={showAIHabitat}
          onClose={() => setShowAIHabitat(false)}
          onSelectClone={(clone) => {
            setCurrentAIClone(clone);
            if (clone && clone.instruction) {
              setSystemInstruction(clone.instruction);
            }
          }}
          currentCloneId={currentAIClone?.id}
        />
      )}

      {/* Mini Apps Generator */}
      {showMiniApps && (
        <MiniAppsGenerator
          isOpen={showMiniApps}
          onClose={() => setShowMiniApps(false)}
        />
      )}

      {/* User Learning */}
      {showUserLearning && (
        <UserLearning
          isOpen={showUserLearning}
          onClose={() => setShowUserLearning(false)}
          chatHistory={chat}
        />
      )}
    </div>
  );
}
