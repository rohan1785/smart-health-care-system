import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Hospital from './pages/Hospital'
import Citizen from './pages/Citizen'
import Authority from './pages/Authority'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hospital" element={<Layout><Hospital /></Layout>} />
        <Route path="/citizen" element={<Layout><Citizen /></Layout>} />
        <Route path="/authority" element={<Layout><Authority /></Layout>} />
      </Routes>
    </Router>
  )
}

export default App
