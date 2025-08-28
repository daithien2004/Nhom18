import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
function App() {
  return (
    <div>
      <Routes>
        <Route path="/home" element={<HomePage />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/register" element={<Register />}></Route>
      </Routes>
    </div>
  );
}

export default App;
