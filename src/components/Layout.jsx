import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function Layout({ children }) {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <>
      <Navbar logout={logout} />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  )
}

export default Layout
