import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path, state) => {
    setMenuOpen(false);
    navigate(path, { state });
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '80px', background: '#ffffff',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontFamily: 'Inter, sans-serif'
    }}>
      {/* Brand Section */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <h1 style={{ color: '#2563EB', fontSize: '1.6rem', fontWeight: '800', lineHeight: '1.2', margin: 0 }}>
          Arogya360🏥
        </h1>
        <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: '500' }}>
          Municipal Corporation Under Arogya360
        </span>
      </div>

      {/* Hamburger Menu (3 lines) */}
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', 
            display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px'
          }}
        >
          <div style={{ width: '25px', height: '3px', backgroundColor: '#374151', borderRadius: '3px', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none' }}></div>
          <div style={{ width: '25px', height: '3px', backgroundColor: '#374151', borderRadius: '3px', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }}></div>
          <div style={{ width: '25px', height: '3px', backgroundColor: '#374151', borderRadius: '3px', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none' }}></div>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div style={{
            position: 'absolute', top: '50px', right: '0',
            background: 'white', borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            minWidth: '220px', padding: '10px 0',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', border: '1px solid #E5E7EB'
          }}>
            <button 
              onClick={() => handleNavigation('/login', { role: 'hospital' })}
              style={{
                width: '100%', padding: '12px 20px', background: 'none', border: 'none',
                textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', color: '#374151',
                fontWeight: '500', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              🏥 Hospital Dashboard
            </button>
            <button 
              onClick={() => handleNavigation('/login', { role: 'authority' })}
              style={{
                width: '100%', padding: '12px 20px', background: 'none', border: 'none',
                textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', color: '#374151',
                fontWeight: '500', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              📊 Authority Dashboard
            </button>
            <button 
              onClick={() => handleNavigation('/hirkani')}
              style={{
                width: '100%', padding: '12px 20px', background: 'none', border: 'none',
                textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', color: '#374151',
                fontWeight: '500', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              👶 Hirkani
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
