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
import StatisticsPage from './pages/StatisticsPage';
import ActivityPage from './pages/ActivityPage'; // <- import ActivityPage
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // nhớ import css
import { SocketProviders } from './sockets/SocketProviders';
import { useAppSelector } from './store/hooks';
import PrivateRoute from './components/PrivateRoute';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  const isAuthenticated = useAppSelector((state) => !!state.auth.token);

  return (
    <SocketProviders>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="posts/:postId" element={<PostDetail />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="activities" element={<ActivityPage />} />
          </Route>
        </Route>
      </Routes>

      {/* Container chung cho toàn bộ app */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
      />
    </SocketProviders>
  );
}

export default App;
