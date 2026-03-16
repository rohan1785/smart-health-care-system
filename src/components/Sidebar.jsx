import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()

  const menuItems = [
    { href: '/', icon: '🏠', label: 'Home' },
    { href: '/citizen', icon: '👤', label: 'Citizen Portal' },
    { href: '/hospital', icon: '🏥', label: 'Hospital Dashboard' },
    { href: '/authority', icon: '📊', label: 'Authority Dashboard' },
    { href: '/login', icon: '🔐', label: 'Login' },
  ]

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.href} className="sidebar-item">
            <Link 
              to={item.href} 
              className={`sidebar-link ${location.pathname === item.href ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
