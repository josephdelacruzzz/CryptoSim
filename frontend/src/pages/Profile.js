import { useState } from 'react'
import axios from 'axios'
import { useAlert } from '../components/Alert'

function Profile() {
    const [username, setUsername] = useState('')
    const [userData, setUserData] = useState(null)
    const {AlertComponent, showAlert } = useAlert()

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/api/transactions/${username}`)
            setUserData(response.data)
        } catch (error) {
            showAlert('Error fetching user data: ' + (error.response?.data?.error || 'User not found'))
        }
    }

    return (
        <div className="profileContainer">
        <AlertComponent />

            <h1>User Search</h1>
            <div className="searchContainer">
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder = "Enter username"/>
                    <button onClick={handleSearch}>Search</button>
            </div>

            {userData && (
                <div className="userPortfolio">
                <h2>{username}'s Portfolio</h2>
                {userData.length > 0 ? (
                    <div className="cryptoTable">
                        <div className="tableHeader">
                            <div className="headerCell">Coin</div>
                            <div className="headerCell">Amount</div>
                            <div className="headerCell">Avg Buy Price</div>
                        </div>
                        
                        {userData.map((item, index) => (
                            <div className="tableRow" key={index}>
                                <div className="tableCell">{item.cryptoId}</div>
                                <div className="tableCell">{item.amount.toFixed(4)}</div>
                                <div className="tableCell">${item.avgBuyPrice.toFixed(4)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="noHoldings">No holdings found for this user.</p>
                )}
            </div>
            )}
        </div>
    )

}
export default Profile