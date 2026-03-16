import { Link } from 'react-router-dom'

function Navbar({ logout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>🏥</span>
        Smart Health System
      </div>
      
      <div className="navbar-actions">
        <Link to="/login">
          <button className="nav-btn primary">
            Login
          </button>
        </Link>
        <button onClick={logout} className="nav-btn secondary">
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
