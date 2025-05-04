import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {useState, useEffect} from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import MyPortfolio from './pages/MyPortfolio'
import Nav from './components/Nav'


function App() {
  const [loggedInUser, setLoggedInUser] = useState(null)

  useEffect(() => {
    const username = localStorage.getItem('username');
      const userData = localStorage.getItem('userData');
      
      if (username && userData) {
          try {
              setLoggedInUser(JSON.parse(userData));
          } catch {
              localStorage.removeItem('username');
              localStorage.removeItem('userData');
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
          <Route path="/myPortfolio" element={<MyPortfolio loggedInUser={loggedInUser}/>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;