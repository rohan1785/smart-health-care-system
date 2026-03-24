import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '80px', background: '#ffffff',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontFamily: 'Inter, sans-serif'
    }}>
      {/* Brand Section */}
      <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }}
  onClick={() => navigate('/')}
>
  <img
    src="img\Gemini_Generated_Image_e61tpje61tpje61t-removebg-preview copy.png"
    alt="Arogya360 Logo"
    style={{
      height: '100px',   // adjust size as needed
      objectFit: 'contain'
    }}
  />
</div>

      {/* Direct Horizontal Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>

        <button 
          onClick={() => navigate('/login', { state: { role: 'hospital' } })}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', 
            fontSize: '1rem', color: '#374151', fontWeight: '500',
            padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
            e.currentTarget.style.color = '#2563EB';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#374151';
          }}
        >
          Hospital
        </button>
        <button 
          onClick={() => navigate('/login', { state: { role: 'authority' } })}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', 
            fontSize: '1rem', color: '#374151', fontWeight: '500',
            padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
            e.currentTarget.style.color = '#2563EB';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#374151';
          }}
        >
          Authority
        </button>
        <button 
          onClick={() => navigate('/hirkani')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', 
            fontSize: '1rem', color: '#374151', fontWeight: '500',
            padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
            e.currentTarget.style.color = '#2563EB';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#374151';
          }}
        >
          Hirkani
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
