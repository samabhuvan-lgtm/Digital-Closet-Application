import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Outfit from './pages/Outfit';
import PixelColorWheel from './components/PixelColorWheel';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-container"><div className="loader"></div></div>;
  if (!user) return <Navigate to="/signin" />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/outfit" element={<ProtectedRoute><Outfit /></ProtectedRoute>} />
        </Routes>
        <PixelColorWheel />
      </Router>
    </AuthProvider>
  );
}

export default App;
