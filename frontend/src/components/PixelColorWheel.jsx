import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = [
  { id: 'red', hex: '#e52521', match: 'cyan', label: 'Red' },
  { id: 'red-orange', hex: '#ff4500', match: 'teal', label: 'Red-Orange' },
  { id: 'orange', hex: '#f87800', match: 'blue', label: 'Orange' },
  { id: 'yellow-orange', hex: '#ffb000', match: 'navy', label: 'Yellow-Orange' },
  
  { id: 'pink', hex: '#ff80df', match: 'green', label: 'Pink' },
  { id: 'magenta', hex: '#e525b0', match: 'yellow-green', label: 'Magenta' },
  { id: 'purple', hex: '#6020a0', match: 'yellow', label: 'Purple' },
  { id: 'violet', hex: '#8a2be2', match: 'lime', label: 'Violet' },

  { id: 'cyan', hex: '#00b8f8', match: 'red', label: 'Cyan' },
  { id: 'teal', hex: '#008080', match: 'red-orange', label: 'Teal' },
  { id: 'blue', hex: '#0038f8', match: 'orange', label: 'Blue' },
  { id: 'navy', hex: '#000080', match: 'yellow-orange', label: 'Navy' },
  
  { id: 'green', hex: '#43b047', match: 'pink', label: 'Green' },
  { id: 'yellow-green', hex: '#9acd32', match: 'magenta', label: 'Yellow-Green' },
  { id: 'yellow', hex: '#fbd000', match: 'purple', label: 'Yellow' },
  { id: 'lime', hex: '#32cd32', match: 'violet', label: 'Lime' }
];

export default function PixelColorWheel() {
  const [hovered, setHovered] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="glass-card"
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              width: '260px'
            }}
          >
            <h3 style={{ fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
              Color Matcher
            </h3>
            <p style={{ fontSize: '0.6rem', lineHeight: '1.4', marginBottom: '1rem', textAlign: 'center' }}>
              Hover over a block to see its matching opposite color!
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 36px)',
              gridTemplateRows: 'repeat(4, 36px)',
              gap: '6px',
              justifyContent: 'center'
            }}>
              {colors.map((c) => {
                const isHovered = hovered === c.id;
                const isMatch = hovered === c.match;
                const isDimmed = hovered && !isHovered && !isMatch;

                return (
                  <div
                    key={c.id}
                    onMouseEnter={() => setHovered(c.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: c.hex,
                      border: '3px solid var(--outline)',
                      boxShadow: 'inset -2px -2px 0px rgba(0,0,0,0.3), inset 2px 2px 0px rgba(255,255,255,0.4)',
                      opacity: isDimmed ? 0.2 : 1,
                      transform: isHovered || isMatch ? 'scale(1.15)' : 'scale(1)',
                      zIndex: isHovered || isMatch ? 10 : 1,
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    title={`${c.label} pairs with ${colors.find(col => col.id === c.match)?.label}`}
                  />
                );
              })}
            </div>
            
            <div style={{ marginTop: '1rem', height: '24px', textAlign: 'center' }}>
              {hovered && (
                <span style={{ fontSize: '0.55rem', color: 'var(--coin)', lineHeight: '1.4', display: 'block' }}>
                  {colors.find(c => c.id === hovered)?.label} matches<br/>
                  {colors.find(c => c.id === colors.find(col => col.id === hovered)?.match)?.label}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className="btn-primary flex-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '0',
          padding: '0',
          marginLeft: 'auto'
        }}
        title="Open Color Matcher"
      >
        🎨
      </button>
    </div>
  );
}
