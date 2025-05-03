import { useState } from 'react'
import axios from 'axios'

function Profile() {
    const [username, setUsername] = useState('')
    const [userData, setUserData] = useState(null)

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:50001/api/transactions/${username}`)
            setUserData(response.data)
        } catch (error) {
            alert('Error fetching user data: ' + (error.response?.data?.error || 'User not found'))
        }
    }

    return (
        <div>
            <h1>User Profile</h1>
            <div>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder = "Enter username"/>
                <button onClick={handleSearch}>Search</button>
            </div>

            {userData && (
                <div>
                    <h2>Portfolio</h2>
                    <ul>
                        {userData.map((item,index) => (
                            <li key={index}>
                                {item.cryptoId}: {item.amount} coins
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )

}
export default Profile