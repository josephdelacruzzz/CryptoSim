import { useState, useEffect} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Home({loggedInUser, setLoggedInUser}) {
    const [cryptos, setCryptos] = useState([])
    const [selectedCrypto, setSelectedCrypto] = useState(null);
    const [amount, setAmount] = useState('');
    const [userBalance, setUserBalance] = useState(0)

    const navigate = useNavigate()

    useEffect(() => {
        axios.get('http://localhost:5001/api/crypto')
        .then(response => setCryptos(response.data))
        .catch(error => console.error('Error:', error))

        if (loggedInUser) {
            fetchUserBalance()
        }
            
    }, [loggedInUser])

    const fetchUserBalance = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5001/api/auth/me?username=${loggedInUser.username}`
            );
            setUserBalance(response.data.balance || 0);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };


    const handleBuyClick = (crypto) => {

        if (!loggedInUser) {
          alert('Please login first')
          navigate('/login')
          return;
        }
        
        setSelectedCrypto(crypto)
        setAmount(1);
    };
    
    const confirmPurchase = async () => {
        if (!amount || isNaN(amount)) {
          alert('Please enter a valid amount')
          return;
        }

        const username = localStorage.getItem('username')
        if (!username) {
            alert('Session expired. Please login again.')
            navigate('/login')
            return
        }

        const totalCost = parseFloat(amount) * selectedCrypto.current_price;
        if (userBalance < totalCost) {
            alert('Insufficient funds');
            return;
       }

        try {
          await axios.post('http://localhost:5001/api/transactions/buy',
            { username: username, cryptoId: selectedCrypto.id, amount: parseFloat(amount)},
          );
          alert(`Successfully purchased ${amount} ${selectedCrypto.name.toUpperCase()}!`);
          setSelectedCrypto(null)
          setAmount('')
          fetchUserBalance()
        } catch (error) {
          alert('Purchase failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const totalCost = amount && selectedCrypto?.current_price ? parseFloat(amount) * selectedCrypto.current_price : 0


    return (
        <div className="homeContainer">
            <h1 className="marketTitle"> CryptoSim </h1>

            {loggedInUser && (
                <div className="userInfo"> 
                    <div className="welcome"> Welcome, {loggedInUser.username}</div>
                    <div className="balance">Available Balance: <span>${userBalance.toFixed(4)}</span></div>
                </div>
            )}

            {loggedInUser && ( <div> Logged in as: <strong>{loggedInUser.username}</strong></div>)}
            <div className="cryptoTable">
                <div className="tableHeader">
                    <div className="headerCell">Coin</div>
                    <div className="headerCell">Price</div>
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