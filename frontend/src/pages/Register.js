import {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAlert } from '../components/Alert'

function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const {AlertComponent, showAlert } = useAlert()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5001/api/auth/register', {username, password})
            showAlert('Registration successful! Login to continue', () => {
                navigate('/login')
            })
        } catch (error) {
            showAlert('Registration failed: ' + (error.response?.data?.error || "Username already exists"))
        }
    }
    
    return (
        <div className="auth">
            <AlertComponent />
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