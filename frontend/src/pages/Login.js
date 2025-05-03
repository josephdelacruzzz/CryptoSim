import { useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('http://localhost:5001/api/auth/login', {username, password})
        .then(response => {
            alert('Login succesful!')
            navigate('/profile')
        })
        .catch(error => alert("Login failed: " + error.response?.data?.error))
    }

    return (
        <div>
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