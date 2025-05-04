import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function MyPortfolio({loggedInUser}) {
    const [portfolio, setPortfolio] = useState([])
    const [balance, setBalance] = useState(0)
    const [selectedCrypto, setSelectedCrypto] = useState(null)
    const [sellAmount, setSellAmount] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (!loggedInUser) {
            navigate('/login')
            return
        }
        fetchPortfolio()
    }, [loggedInUser, navigate])

    const fetchPortfolio = async () => {
        try {
            const portfolioRes = await axios.get(
                `http://localhost:5001/api/transactions/${loggedInUser.username}`
            )
            setPortfolio(portfolioRes.data)

            const userRes = await axios.get(
                `http://localhost:5001/api/auth/me?username=${loggedInUser.username}`
            )
            setBalance(userRes.data.balance || 0)
        } catch (error) {
            console.error('Error fetching portfolio:', error)
        }
    }

    const handleSellClick = (crypto) => {
        setSelectedCrypto(crypto)
        setSellAmount('')
    }

    const confirmSell = async () => {
        if (!sellAmount || isNaN(sellAmount) || parseFloat(sellAmount) <= 0) {
            alert('Please enter a valid amount to sell')
            return
        }

        try {
            await axios.post('http://localhost:5001/api/transactions/sell', {
                username: loggedInUser.username,
                cryptoId: selectedCrypto.cryptoId,
                amount: parseFloat(sellAmount)
            })
            
            alert(`Successfully sold ${sellAmount} ${selectedCrypto.cryptoId}!`)
            setSelectedCrypto(null)
            fetchPortfolio() 
        } catch (error) {
            alert('Sale failed: ' + (error.response?.data?.error || error.message))
        }
    }

    if (!loggedInUser) {
        return null
    }

    return (
        <div className="myPortfolioContainer">
            <h1>My Portfolio</h1>
            
            <div className="accountSummary">
                <h2 className="balance">Available Balance: <span>${balance.toFixed(2)}</span></h2>
            </div>

            <div className="holdings">
                <h3>My Holdings</h3>
                {portfolio.length > 0 ? (
                    <div className="portfolioTable">
                        <div className="tableHeader">
                            <div className="headerCell">Coin</div>
                            <div className="headerCell">Amount</div>
                            <div className="headerCell">Avg. Buy Price</div>
                            <div className="headerCell actionCell">Actions</div>
                        </div>
                    
                        {portfolio.map((item, index) => (
                        <div className="tableRow" key={index}>
                            <div className="tableCell">{item.cryptoId}</div>
                            <div className="tableCell">{item.amount.toFixed(4)}</div>
                            <div className="tableCell">${item.avgBuyPrice.toFixed(2)}</div>
                            <div className="tableCell actionCell">
                                <button onClick={() => handleSellClick(item)} className="sellButton">Sell</button>
                            </div>
                        </div>
                    ))}
                </div>
                ) : (
                    <p className="noHoldings">No Holdings 🤣😂 </p>
                )}
            </div>

            {/* Sell Modal */}
            {selectedCrypto && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <h3>Sell {selectedCrypto.cryptoId}</h3>
                        <p>Available: {selectedCrypto.amount.toFixed(4)}</p>
                        
                        <div className="formGroup">
                            <label>Amount to Sell:</label>
                            <input type="number" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} min="0.0001" max={selectedCrypto.amount} step="0.0001" />
                        </div>
                        
                        <div className="modalButtons">
                            <button onClick={confirmSell} className="confirmButton"> Confirm </button>
                            <button onClick={() => setSelectedCrypto(null)} className="cancelButton"> Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyPortfolio;
