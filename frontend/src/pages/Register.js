import {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5001/api/auth/register', {username, password})
            alert('Registration succesful! Login to continue')
            navigate('/login')
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data?.error || "Username already exists"))
        }
    }
    
    return (
        <div className="auth">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default Register