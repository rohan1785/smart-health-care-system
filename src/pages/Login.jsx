import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "../firebase"

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      if (username === 'hospital' && password === '123') {
        localStorage.setItem('role', 'hospital')
        navigate('/hospital')
        return
      } else if (username === 'admin' && password === '123') {
        localStorage.setItem('role', 'admin')
        navigate('/authority')
        return
      } else if (username === 'citizen' && password === '123') {
        localStorage.setItem('role', 'citizen')
        navigate('/citizen')
        return
      }

      // Try Firebase authentication for actual registered users
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );
      
      const user = userCredential.user;
      console.log('Logged in user:', user);
      
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        localStorage.setItem('role', role);
        
        if (role === 'citizen') {
          navigate('/citizen');
        } else if (role === 'hospital') {
          navigate('/hospital');
        } else if (role === 'authority' || role === 'admin') {
          localStorage.setItem('role', 'admin'); // Fallback map if needed by UI
          navigate('/authority');
        } else {
           navigate('/');
        }
      } else {
        console.error("No user document found!");
        alert("User role not found or user document does not exist.");
      }

    } catch (error) {
      console.error("Login error:", error.message)
      alert('Invalid login credentials')
    }
  }
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google logged in user:', user);
      
      // Attempt to check if this google user has a specific role set in our DB
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        localStorage.setItem('role', role);
        navigate(role === 'hospital' ? '/hospital' : role === 'citizen' ? '/citizen' : '/authority');
      } else {
        // Save new user to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || 'Google User',
          email: user.email,
          role: "citizen"
        });

        localStorage.setItem('role', 'citizen');
        navigate('/citizen');
      }

    } catch (error) {
      console.error("Google Login Error:", error.message);
      alert('Failed to login with Google.');
    }
  };

  const demoAccounts = [
    { role: 'Citizen', username: 'citizen', password: '123', icon: '👤', color: '#0ea5e9' },
    { role: 'Hospital', username: 'hospital', password: '123', icon: '🏥', color: '#10b981' },
    { role: 'Authority', username: 'admin', password: '123', icon: '📊', color: '#8b5cf6' },
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #e0e7ff 0%, #f8fafc 100%)',
      padding: '20px',
      fontFamily: '"Inter", sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05), 0 0 10px rgba(0,0,0,0.01)',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'white',
            fontSize: '32px',
            boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.4)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            color: '#0f172a',
            letterSpacing: '-0.025em',
            marginBottom: '6px'
          }}>
            Smart Health System
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Sign in to your account</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          {/* Email Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
              Email / Username
            </label>
            <input
              type="text"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '0.95rem',
                color: '#334155',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                Password
              </label>
              <a href="#" style={{ fontSize: '0.875rem', color: '#0ea5e9', textDecoration: 'none', fontWeight: '500' }}>
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '0.95rem',
                color: '#334155',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Login Button */}
          <button 
            onClick={handleLogin} 
            style={{ 
              width: '100%', 
              marginTop: '8px', 
              padding: '16px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2), 0 2px 4px -1px rgba(14, 165, 233, 0.1)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0284c7';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#0ea5e9';
              e.target.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            Sign In
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '1px' }}></div>
            <span style={{ padding: '0 16px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>OR</span>
            <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '1px' }}></div>
          </div>

          <button className="google-btn" onClick={loginWithGoogle}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
            <span>Continue with Google</span>
          </button>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', margin: '0 0 16px 0', fontSize: '0.85rem', fontWeight: '500' }}>
            Demo Accounts — Click to login
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                onClick={() => {
                  setUsername(account.username)
                  setPassword(account.password)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = account.color;
                  e.currentTarget.style.color = account.color;
                  e.currentTarget.style.backgroundColor = `${account.color}0A`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
              >
                <span style={{ fontSize: '1rem' }}>{account.icon}</span>
                {account.role}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              color: '#94a3b8', 
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#64748b'}
            onMouseOut={(e) => e.target.style.color = '#94a3b8'}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
