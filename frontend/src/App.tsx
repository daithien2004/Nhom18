// App.tsx
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MainLayout from './layouts/MainLayout';
import PostDetail from './pages/PostDetail';
import ConversationsPage from './pages/ConversationsPage';
import FriendsPage from './pages/FriendsPage';
import CategoryPage from './pages/CategoryPage';
import { SocketProvider } from './sockets/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />}></Route>
          <Route path="posts/:postId" element={<PostDetail />}></Route>
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="categories" element={<CategoryPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />}></Route>
      </Routes>
    </SocketProvider>
  );
}

export default App;
