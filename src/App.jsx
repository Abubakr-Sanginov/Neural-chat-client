import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import FavoritesPage from "./components/FavoritesPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SharedChatPage from "./pages/SharedChatPage";
import ApiPlayground from "./pages/ApiPlayground";
import ProxyDownloader from "./pages/ProxyDownloader";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/share/:shareId" element={<SharedChatPage />} />
      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat/:chatId" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
        <Route 
        path="/playground" 
        element={
          <ProtectedRoute>
            <ApiPlayground />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/downloader" 
        element={
          <ProtectedRoute>
            <ProxyDownloader />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage
              favoriteChats={
                JSON.parse(localStorage.getItem("favoriteChats") || "[]")
              }
              onRemoveFavorite={(chatId) => {
                const favorites = JSON.parse(
                  localStorage.getItem("favoriteChats") || "[]"
                );
                const updated = favorites.filter((id) => id !== chatId);
                localStorage.setItem("favoriteChats", JSON.stringify(updated));
                window.location.reload();
              }}
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
