import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, Camera, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [clothes, setClothes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState('top');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const { API_URL } = useAuth();

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clothes`);
      setClothes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    try {
      const res = await axios.post(`${API_URL}/clothes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setClothes([...clothes, res.data]);
      setIsUploading(false);
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`${API_URL}/clothes/${id}`);
      setClothes(clothes.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['top', 'bottom', 'shoes', 'accessory'];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem' }}>Your Digital Closet</h2>
        <button className="btn-primary flex-center" style={{ gap: '0.5rem' }} onClick={() => setIsUploading(true)}>
          <Plus size={20} />
          Add Item
        </button>
      </div>

      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card" 
            style={{ padding: '2rem', marginBottom: '2rem', position: 'relative' }}
          >
            <button 
              onClick={() => { setIsUploading(false); setFile(null); setPreview(null); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>Upload New Drip</h3>
            
            <form onSubmit={handleUpload} className="grid grid-cols-2" style={{ gap: '2rem', alignItems: 'start' }}>
              <div 
                className="image-preview" 
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              >
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                    <Camera size={48} />
                    <span>Click to upload image</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Category</label>
                  <select 
                    className="input-field" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ background: 'var(--surface-hover)', appearance: 'none' }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary flex-center" style={{ gap: '0.5rem', width: '100%' }} disabled={!file}>
                  <Upload size={20} />
                  Save Item
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex-center" style={{ padding: '4rem' }}><div className="loader"></div></div>
      ) : (
        <div className="grid grid-cols-4">
          {clothes.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <p>Your closet is empty. Time to add some heat! 🔥</p>
            </div>
          ) : (
            clothes.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="outfit-card glass"
              >
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    left: '0.5rem',
                    zIndex: 20,
                    width: '32px',
                    height: '32px',
                    background: '#e52521', // Mario Red
                    border: '3px solid var(--outline)',
                    color: 'white',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: 'inset -2px -2px 0px rgba(0,0,0,0.4), inset 2px 2px 0px rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                  title="Remove Item"
                >
                  X
                </button>
                <img src={`http://localhost:3000${item.imageUrl}`} alt={item.category} />
                <span className="badge">{item.category.toUpperCase()}</span>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
