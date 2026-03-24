import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } })
  }

  return (
    <>
      {/* Landing Page Hero Section */}
      <div className="landing-page">
        <div className="hero-section">
          <h1 className="hero-title">Smart Public Health Management System</h1>
          <p className="hero-subtitle">
            AI-powered platform for municipal hospitals and public health monitoring. 
            Real-time insights, disease prediction, and efficient resource management.
          </p>

          <div className="portal-cards">
            <div onClick={() => handleRoleSelect('citizen')} className="portal-card" style={{ cursor: 'pointer' }}>
              <div className="portal-icon">👤</div>
              <h3>Citizen Portal</h3>
              <p>Access health alerts, find nearby hospitals, and manage your health records</p>
            </div>

            <div onClick={() => handleRoleSelect('hospital')} className="portal-card" style={{ cursor: 'pointer' }}>
              <div className="portal-icon">🏥</div>
              <h3>Hospital Dashboard</h3>
              <p>Manage hospital resources, bed availability, and patient information</p>
            </div>

            <div onClick={() => handleRoleSelect('authority')} className="portal-card" style={{ cursor: 'pointer' }}>
              <div className="portal-icon">📊</div>
              <h3>Authority Dashboard</h3>
              <p>Monitor city health analytics, send alerts, and predict disease outbreaks</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">🏥</div>
              <h3>12</h3>
              <p>Total Hospitals</p>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">🤒</div>
              <h3>325</h3>
              <p>Total Patients</p>
            </div>
            <div className="stat-card secondary">
              <div className="stat-icon">🛏️</div>
              <h3>140</h3>
              <p>Available Beds</p>
            </div>
            <div className="stat-card accent">
              <div className="stat-icon">⚠️</div>
              <h3>45</h3>
              <p>Active Cases</p>
            </div>
          </div>

          {/* Features Section */}
          <div className="features-section">
            <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#1e293b', marginBottom: '10px' }}>
              System Features
            </h2>
            <p style={{ textAlign: 'center', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Comprehensive tools for managing public health at scale
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>Real-Time Monitoring</h3>
                <p>Track hospital beds and patient load instantly with live dashboards and automatic updates.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3>AI Disease Detection</h3>
                <p>Machine learning models predict disease outbreaks early, enabling proactive measures.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Health Alerts</h3>
                <p>Citizens receive emergency health notifications instantly through multiple channels.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🗺️</div>
                <h3>Geographic Analysis</h3>
                <p>Interactive maps visualize disease spread and healthcare resource distribution.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔮</div>
                <h3>Predictive Analytics</h3>
                <p>AI forecasts disease trends and hospital load to help with resource planning.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure Data</h3>
                <p>Enterprise-grade security ensures patient data privacy and compliance standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
