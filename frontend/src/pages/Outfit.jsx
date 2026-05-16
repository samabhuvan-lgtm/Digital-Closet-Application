import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Outfit() {
  const [outfit, setOutfit] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { API_URL } = useAuth();

  useEffect(() => {
    fetchSavedOutfits();
  }, []);

  const fetchSavedOutfits = async () => {
    try {
      const res = await axios.get(`${API_URL}/outfit/saved`);
      setSavedOutfits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateOutfit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/outfit/random`);
      setOutfit(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate outfit');
    } finally {
      setLoading(false);
    }
  };

  const saveOutfit = async () => {
    if (!outfit.length) return;
    try {
      await axios.post(`${API_URL}/outfit/save`, { outfit });
      fetchSavedOutfits();
      alert('Outfit saved to your favorites! 💖');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Vibe Check</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>Generate a random fit from your closet.</p>
        <button 
          className="btn-primary flex-center" 
          style={{ margin: '0 auto', gap: '0.5rem', padding: '16px 32px', fontSize: '1.2rem' }}
          onClick={generateOutfit}
          disabled={loading}
        >
          {loading ? <div className="loader"></div> : <Sparkles size={24} />}
          Generate Drip
        </button>
        {error && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</p>}
      </div>

      <AnimatePresence>
        {outfit.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ padding: '2rem', marginBottom: '4rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem' }}>Today's Fit</h3>
              <button className="btn-secondary flex-center" style={{ gap: '0.5rem' }} onClick={saveOutfit}>
                <Heart size={20} color="var(--secondary)" />
                Save Fit
              </button>
            </div>
            <div className="grid grid-cols-3">
              {outfit.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="outfit-card glass"
                >
                  <img src={`http://localhost:3000${item.imageUrl}`} alt={item.category} />
                  <span className="badge">{item.category.toUpperCase()}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }} className="text-gradient">Saved Fits</h3>
        {savedOutfits.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No saved fits yet. Generate and save some heat! 🔥</p>
        ) : (
          <div className="grid grid-cols-3">
            {savedOutfits.map((saved) => (
              <div key={saved.id} className="glass-card" style={{ padding: '1rem' }}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {saved.items.map(item => (
                    <img 
                      key={item.id} 
                      src={`http://localhost:3000${item.imageUrl}`} 
                      alt={item.category} 
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '12px' }} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
