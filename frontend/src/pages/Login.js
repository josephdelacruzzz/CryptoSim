import { useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAlert } from '../components/Alert'
import axios from 'axios'

function Login({setLoggedInUser}) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const {AlertComponent, showAlert } = useAlert()

    const handleSubmit = (e) => {
        e.preventDefault()
        localStorage.clear()
        axios.post('http://localhost:5001/api/auth/login', {username, password})
            .then(response => {
                // console.log('response:', response.data)
                if (response.data.success) {
                    localStorage.setItem('username', response.data.user.username)
                    localStorage.setItem('userData', JSON.stringify(response.data.user))
                    setLoggedInUser(response.data.user)
                    showAlert('Login successful!', () => {
                        navigate('/')
                    })
                } else {
                    showAlert("Login failed: " + (response.data.error || "Unknown error", 'error'))
                }
            })
            .catch(error => {
                showAlert("Login failed: " + (error.response?.data?.error || "server error"))
            })
    }

    return (
        <div className="auth">
            <AlertComponent />
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login