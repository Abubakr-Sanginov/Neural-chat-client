export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3080";

export const fetchResponse = async (chat, model) => {
  try {
    // after depoloyment you should change the fetch URL below
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: chat.map((message) => message.message).join(" \n "),
        model: model
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Generate image
export const generateImage = async (prompt) => {
  // Direct client-side generation to avoid server restart requirement
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

  // Simulate an async operation to match previous interface
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ imageUrl });
    }, 500);
  });
};

// Save chat to server
export const saveChat = async (chatId, chat, title) => {
  try {
    const response = await fetch(`${API_URL}/api/chats/save`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatId, chat, title }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error saving chat:", error);
    throw error;
  }
};

// Load chat from server
export const loadChat = async (chatId) => {
  try {
    const response = await fetch(`${API_URL}/api/chats/${chatId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading chat:", error);
    throw error;
  }
};

// Get all chats
export const getAllChats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/chats?t=${Date.now()}`, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error("Error getting chats:", error);
    throw error;
  }
};

// Delete chat
export const deleteChat = async (chatId) => {
  try {
    const response = await fetch(`${API_URL}/api/chats/${chatId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
};

// Rename chat
// Move chat to folder
export const moveChatToFolder = async (chatId, folderId) => {
  try {
    const response = await fetch(`${API_URL}/api/chats/${chatId}/folder`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folderId }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error moving chat to folder:", error);
    throw error;
  }
};

// Get all folders
export const getFolders = async () => {
  try {
    const response = await fetch(`${API_URL}/api/folders`, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error("Error getting folders:", error);
    throw error;
  }
};

// Create folder
export const createFolder = async (name) => {
  try {
    const response = await fetch(`${API_URL}/api/folders`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
};

// Update folder
export const updateFolder = async (id, name) => {
  try {
    const response = await fetch(`${API_URL}/api/folders/${id}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating folder:", error);
    throw error;
  }
};

// Delete folder
export const deleteFolder = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/folders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};

export const renameChat = async (chatId, newTitle) => {
  try {
    const response = await fetch(`${API_URL}/api/chats/${chatId}/rename`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTitle }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error renaming chat:", error);
    throw error;
  }
};

// Streaming response with multimodal support and model settings
export const fetchStreamResponse = async (chat, model, systemInstruction, modelSettings, onChunk, signal, useWebSearch = false) => {
  try {
    // Always use structured format for better context handling
    const messagePayload = chat.map((msg) => {
      const parts = [];

      if (msg.images && msg.images.length > 0) {
        msg.images.forEach((img) => {
          const [mimeType, base64Data] = img.data.split(',');
          // Extract mime type from data URL (e.g., "data:application/pdf;base64")
          const mime = mimeType.match(/:(.*?);/)?.[1];

          // Default to image/jpeg if not found, but respect pdf/txt
          const finalMime = mime || 'image/jpeg';

          parts.push({
            inlineData: {
              mimeType: finalMime,
              data: base64Data
            }
          });
        });
      }

      if (msg.message) {
        parts.push({ text: msg.message });
      }

      return { role: msg.sender === "user" ? "user" : "model", parts };
    });

    console.log('=== ОТПРАВКА НА СЕРВЕР ===');
    console.log('Model:', model);
    console.log('System Instruction:', systemInstruction || 'ПУСТО!!!');
    console.log('Messages count:', messagePayload.length);
    console.log('Use Web Search:', useWebSearch);
    console.log('==========================');


    const response = await fetch(`${API_URL}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messagePayload,
        model: model,
        systemInstruction: systemInstruction,
        modelSettings: modelSettings,
        useWebSearch: useWebSearch
      }),
      signal: signal
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.chunk) {
              console.log('Received chunk:', parsed.chunk);
              onChunk(parsed.chunk);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error("Streaming error:", error);
    throw error;
  }
};

// Generate chat title
export const generateChatTitle = async (chat, model) => {
  try {
    const firstMessage = chat.find(m => m.sender === 'user')?.message || "";
    if (!firstMessage) return "New Chat";

    // Use a simple non-streaming call if possible, but we reuse the stream endpoint for simplicity
    // We just want the text.
    const response = await fetch(`${API_URL}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: [{ role: "user", parts: [{ text: `Generate a very short, concise title (max 3-5 words) for a chat that starts with this message: "${firstMessage}". Do not use quotes. Output ONLY the title.` }] }],
        model: model,
        systemInstruction: "You are a helpful assistant that generates short, concise titles for chats.",
        modelSettings: { temperature: 0.7 }
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let title = "";

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
            if (parsed.chunk) {
              title += parsed.chunk;
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
    return title.trim() || "New Chat";
  } catch (error) {
    console.error("Error generating title:", error);
    return "New Chat";
  }
};

// ============================================
// Authentication API
// ============================================

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Register new user
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get profile');
    }

    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (updates) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// ============================================
// User API
// ============================================

// Search users
export const searchUsers = async (query = '') => {
  try {
    const url = query
      ? `${API_URL}/api/users?search=${encodeURIComponent(query)}`
      : `${API_URL}/api/users`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to search users');
    }

    return data;
  } catch (error) {
    console.error('Search users error:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user');
    }

    return data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// ============================================
// Room API
// ============================================

// Create new room
export const createRoom = async (name, description = '', memberIds = []) => {
  try {
    const response = await fetch(`${API_URL}/api/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, memberIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create room');
    }

    return data;
  } catch (error) {
    console.error('Create room error:', error);
    throw error;
  }
};

// Get all user's rooms
export const getUserRooms = async () => {
  try {
    const response = await fetch(`${API_URL}/api/rooms`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get rooms');
    }

    return data;
  } catch (error) {
    console.error('Get rooms error:', error);
    throw error;
  }
};

// Get room details with messages
export const getRoomDetails = async (roomId) => {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get room details');
    }

    return data;
  } catch (error) {
    console.error('Get room details error:', error);
    throw error;
  }
};

// Send message to room
export const sendRoomMessage = async (roomId, message) => {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send message');
    }

    return data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

// Add member to room
export const addRoomMember = async (roomId, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add member');
    }

    return data;
  } catch (error) {
    console.error('Add member error:', error);
    throw error;
  }
};

// Remove member from room
export const removeRoomMember = async (roomId, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}/members/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove member');
    }

    return data;
  } catch (error) {
    console.error('Remove member error:', error);
    throw error;
  }
};

// Update room
export const updateRoom = async (roomId, updates) => {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update room');
    }

    return data;
  } catch (error) {
    console.error('Update room error:', error);
    throw error;
  }
};

// Delete room
export const deleteRoom = async (roomId) => {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete room');
    }

    return data;
  } catch (error) {
    console.error('Delete room error:', error);
    throw error;
  }
};
