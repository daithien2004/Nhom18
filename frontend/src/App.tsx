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
import MessagesPage from './pages/MessagesPage';
import FriendsPage from './pages/FriendsPage';

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />}></Route>
        <Route path="posts/:postId" element={<PostDetail />}></Route>
        <Route path="messages" element={<MessagesPage />} />
        <Route path="friends" element={<FriendsPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />}></Route>
    </Routes>
  );
}

export default App;
