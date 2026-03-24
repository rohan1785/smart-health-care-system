import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()
  
  const isAuth = localStorage.getItem("isAuth")
  const role = localStorage.getItem("role")

  const menuItems = [
    { href: '/', icon: '🏠', label: 'Home' },
  ]

  if (role === 'citizen') {
    menuItems.push({ href: '/citizen', icon: '👤', label: 'Citizen Portal' })
  } else if (role === 'hospital') {
    menuItems.push({ href: '/hospital', icon: '🏥', label: 'Hospital Dashboard' })
  } else if (role === 'authority') {
    menuItems.push({ href: '/authority', icon: '📊', label: 'Authority Dashboard' })
  }

  // NEW: Profile is visible ONLY after login
  if (isAuth === 'true') {
    menuItems.push({ href: '/profile', icon: '⚙️', label: 'My Profile' })
  }

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
