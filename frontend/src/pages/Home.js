import { useState, useEffect} from 'react'
import axios from 'axios'

function Home({loggedInUser, setLoggedInUser}) {
    const [cryptos, setCryptos] = useState([])
    // const [loggedInUser, setLoggedInUser] = useState(null);
    const [selectedCrypto, setSelectedCrypto] = useState(null);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5001/api/crypto')
        .then(response => setCryptos(response.data))
        .catch(error => console.error('Error:', error))

        const checkAuth = () => {
            const storedUsername = localStorage.getItem('username')
            const storedToken = localStorage.getItem('token')
            if (storedUsername && storedToken) {
                setLoggedInUser({username: storedUsername})
            }
        }

        checkAuth()
                
    }, [setLoggedInUser])

    const handleBuyClick = (crypto) => {
        console.log('1. Buy button clicked for:', crypto.id)
        console.log('2. Current loggedInUser:', loggedInUser)
        console.log('3. localStorage username:', localStorage.getItem('username'))

        if (!loggedInUser) {
          alert('Please login first')
          return;
        }

        console.log('4. Setting selected crypto:', crypto)
        setSelectedCrypto(crypto)
        setAmount(1);
        console.log('5. Selected crypto after set:', selectedCrypto)
    };
    
    const confirmPurchase = async () => {
        if (!amount || isNaN(amount)) {
          alert('Please enter a valid amount')
          return;
        }

        const token = localStorage.getItem('token')
        if (!token || !loggedInUser) {
            alert('Please Login.')
            return
        }
    
        try {
          await axios.post('http://localhost:5001/api/transactions/buy',
            { username: loggedInUser.username, cryptoId: selectedCrypto.id, amount: parseFloat(amount)},
            {headers: { 'x-auth-token': localStorage.getItem('token') }}
          );
          alert(`Successfully purchased ${amount} ${selectedCrypto.name.toUpperCase()}!`);
          setSelectedCrypto(null);
          setAmount('');
        } catch (error) {
          alert('Purchase failed: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="homeContainer">
            <h1 className="marketTitle"> Crypto Market </h1>

            {loggedInUser && ( <div style={{ marginBottom: '1rem' }}> Logged in as: <strong>{loggedInUser.username}</strong></div>)}
            <div className="cryptoTable">
                <div className="tableHeader">
                    <div className="headerCell">Coin</div>
                    <div className="headerCell">Price</div>
                    <div className="headerCell">Market Cap</div>
                    <div className="headerCell">24h Change</div>
                    <div className="headerCell">Purchase</div>
                </div>

                {cryptos.map(crypto => (
                    <div className="tableRow" key={crypto.id}>
                        <div className="tableCell coinCell">
                            {/* <span className="coinSymbol">{crypto.symbol?.toUpperCase()}</span> */}
                            <span className="coinName">{crypto.name}</span>
                        </div>
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
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.0001" step="0.0001"/>
                        </div>

                        <div clasName="modalButtons">
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