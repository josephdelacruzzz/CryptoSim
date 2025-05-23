import { useState, useEffect} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAlert } from '../components/Alert'

function Home({loggedInUser, setLoggedInUser}) {
    const [cryptos, setCryptos] = useState([])
    const [selectedCrypto, setSelectedCrypto] = useState(null)
    const [amount, setAmount] = useState('')
    const [userBalance, setUserBalance] = useState(0)
    const {AlertComponent, showAlert } = useAlert()
    const navigate = useNavigate()

    useEffect(() => {
        axios.get('http://localhost:5001/api/crypto')
        .then(response => setCryptos(response.data))
        .catch(error => console.error('Error:', error))

        if (loggedInUser) {
            fetchUserBalance()
        }
    // eslint-disable-next-line
    }, [loggedInUser])

    const fetchUserBalance = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5001/api/auth/me?username=${loggedInUser.username}`
            )
            setUserBalance(response.data.balance || 0)
        } catch (error) {
            console.error('Error fetching balance:', error)
        }
    }


    const handleBuyClick = (crypto) => {
        if (!loggedInUser) {
          showAlert('Please login first', () => {
            navigate('/login')
          })
          return
        }
        
        setSelectedCrypto(crypto)
        setAmount(1)
    }
    
    const confirmPurchase = async () => {
        if (!amount || isNaN(amount)) {
          showAlert('Please enter a valid amount')
          return
        }

        const username = localStorage.getItem('username')
        if (!username) {
            showAlert('Session expired. Please login again.', () => {
                navigate('/login')
           })
            return
        }

        const totalCost = parseFloat(amount) * selectedCrypto.current_price
        if (userBalance < totalCost) {
            setSelectedCrypto(null)
            showAlert('Insufficient funds')
            return
       }

        try {
          await axios.post('http://localhost:5001/api/transactions/buy',
            { username: username, cryptoId: selectedCrypto.id, amount: parseFloat(amount)},
          )
          setSelectedCrypto(null)
          showAlert(`Successfully purchased ${parseFloat(amount).toFixed(4)} ${selectedCrypto.name.toUpperCase()}!`, () => {
             setAmount('')
             fetchUserBalance()
         })
        } catch (error) {
          showAlert('Purchase failed: ' + (error.response?.data?.error || error.message))
        }
    }

    const totalCost = amount && selectedCrypto?.current_price ? parseFloat(amount) * selectedCrypto.current_price : 0

    return (
        <div className="homeContainer">
        <AlertComponent />
            {loggedInUser && (
                <div> 
                    <div className="welcome"> Welcome, {loggedInUser.username}!</div>
                    <div className="balance">Available Balance (USD): <span>${userBalance.toFixed(4)}</span></div>
                </div>
            )}

            <div className="cryptoTable">
                <div className="tableHeader">
                    <div className="headerCell">Coin</div>
                    <div className="headerCell">Price (USD)</div>
                    <div className="headerCell">Market Cap</div>
                    <div className="headerCell">24h Change</div>
                    <div className="headerCell">Buy</div>
                </div>

                {cryptos.map(crypto => (
                    <div className="tableRow" key={crypto.id}>
                        <div className="tableCell">{crypto.name}</div>
                        <div className="tableCell">${crypto.current_price?.toLocaleString()}</div>
                        <div className="tableCell">${crypto.market_cap?.toLocaleString()}</div>
                        <div className={`tableCell ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>{crypto.price_change_percentage_24h?.toFixed(2)}%</div>
                        <div className="tableCell">
                            <button onClick={() => handleBuyClick(crypto)} className="buyButton">Buy</button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedCrypto && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <h3>Buy {selectedCrypto.name}</h3>
                        <p>Current Price: ${selectedCrypto.current_price}</p>
                    
                        <div className="modalInputGroup">
                            <label>Amount to buy: </label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.00001" step="0.00001"/>
                        </div>
                        <p>Total Cost: ${totalCost.toFixed(4)}</p>

                        <div className="modalButtons">
                            <button onClick={confirmPurchase}>Confirm</button>
                            <button onClick={() => setSelectedCrypto(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home