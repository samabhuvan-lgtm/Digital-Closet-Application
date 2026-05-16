import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shirt, LogOut, Sparkles, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="nav-bar glass"
    >
      <Link to="/" className="flex-center" style={{ textDecoration: 'none', gap: '0.5rem' }}>
        <Shirt size={28} color="white" />
        <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '800' }}>
          DripDrop
        </h1>
      </Link>
      
      <div className="nav-links">
        <Link to="/" className={`nav-link flex-center ${location.pathname === '/' ? 'active' : ''}`} style={{ gap: '0.5rem' }}>
          <Shirt size={18} />
          Closet
        </Link>
        <Link to="/outfit" className={`nav-link flex-center ${location.pathname === '/outfit' ? 'active' : ''}`} style={{ gap: '0.5rem' }}>
          <Sparkles size={18} />
          Outfits
        </Link>
      </div>

      <div className="flex-center" style={{ gap: '1rem' }}>
        <span style={{ color: 'white' }}>@{user?.username}</span>
        
        <button 
          onClick={() => setIsDark(!isDark)} 
          className="btn-secondary flex-center" 
          style={{ padding: '8px', gap: '0' }}
          title="Toggle Theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button onClick={logout} className="btn-secondary flex-center" style={{ padding: '8px 16px', gap: '0.5rem' }}>
          <LogOut size={16} />
          Quit
        </button>
      </div>
    </motion.nav>
  );
}
