import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  
  // Check if backend is running
  useEffect(() => {
    fetch('http://localhost:5000/health')
      .then(response => response.json())
      .then(data => {
        setBackendStatus(`Backend is running: ${data.message}`)
      })
      .catch(err => {
        setBackendStatus('Backend connection error. Make sure the backend is running on port 5000.')
        console.error('Backend connection error:', err)
      })
  }, [])
  
  // Handle login
  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    
    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setLoggedIn(true)
        setUser(data.user)
        // In a real app, store token in localStorage
      } else {
        setError(data.message || 'Login failed')
      }
    })
    .catch(err => {
      setError('Login error. Check console for details.')
      console.error('Login error:', err)
    })
  }
  
  // Handle logout
  const handleLogout = () => {
    setLoggedIn(false)
    setUser(null)
    // In a real app, remove token from localStorage
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>TamkeenAI Career System</h1>
        <p className={backendStatus.includes('error') ? 'error' : 'success'}>
          {backendStatus}
        </p>
      </header>
      
      <main>
        {!loggedIn ? (
          <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleLogin}>
              <div>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Login</button>
            </form>
            <p className="help-text">
              Try username: "admin" with password: "password123"
            </p>
          </div>
        ) : (
          <div className="dashboard">
            <h2>Welcome, {user.username}!</h2>
            <p>You are logged in with role: {user.roles.join(', ')}</p>
            <button onClick={handleLogout}>Logout</button>
            
            <div className="feature-card">
              <h3>Resume Analysis</h3>
              <p>Upload your resume to get AI-powered analysis and suggestions.</p>
              <button>Try Resume Analysis</button>
            </div>
            
            <div className="feature-card">
              <h3>Interview Practice</h3>
              <p>Practice interviews with AI feedback.</p>
              <button>Start Practice</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App 