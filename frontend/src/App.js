import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {useState, useEffect} from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Nav from './components/Nav'

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setLoggedInUser({ username: user.username })
      } catch (e) {
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  return (
    <Router>
      <Nav loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser}/>
      <div className = "pages">
        <Routes>
          <Route path="/" element={<Home loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser}/>} />
          <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser}/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/profile" element={<Profile loggedInUser={loggedInUser}/>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;