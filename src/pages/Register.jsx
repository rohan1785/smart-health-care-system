import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('citizen')
  
  const navigate = useNavigate()

  const handleRegister = (e) => {
    e.preventDefault()

    // Create user profile 
    const newUser = {
      name,
      email,
      password,
      role
    }

    // Save user in localStorage
    localStorage.setItem("user", JSON.stringify(newUser))
    
    // Also save auth state so they are automatically logged in
    localStorage.setItem("isAuth", "true")
    localStorage.setItem("role", role)
    
    // Redirect to their respective dashboard
    navigate(`/${role}`)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top, #e0e7ff 0%, #f8fafc 100%)', padding: '20px', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Create Account</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Join the Smart Health System</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="citizen">Citizen</option>
              <option value="hospital">Hospital</option>
              <option value="authority">Authority</option>
            </select>
          </div>

          <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>
            Register Now
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.95rem' }}>
          <span style={{ color: '#64748b' }}>Already have an account? </span>
          <Link to="/login" style={{ color: '#0ea5e9', fontWeight: '600', textDecoration: 'none' }}>Log in</Link>
        </div>

      </div>
    </div>
  )
}

export default Register
