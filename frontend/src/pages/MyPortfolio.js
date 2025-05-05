import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function MyPortfolio({loggedInUser}) {
    const [portfolio, setPortfolio] = useState([])
    const [balance, setBalance] = useState(0)
    const [selectedCrypto, setSelectedCrypto] = useState(null)
    const [sellAmount, setSellAmount] = useState('')
    const [currentPrice, setCurrentPrice] = useState(null)
    const [transactionHistory, setTransactionHistory] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        if (!loggedInUser) {
            navigate('/login')
            return
        }
        fetchPortfolio()
    }, [loggedInUser, navigate])

    useEffect(() => {
        const fetchCurrentPrice = async (cryptoId) => {
            try {
                const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`);
                setCurrentPrice(response.data[cryptoId]?.usd || null);
            } catch (error) {
                console.error('Error fetching current price:', error);
                setCurrentPrice(null); 
            }
        };

        if (selectedCrypto) {
            fetchCurrentPrice(selectedCrypto.cryptoId);
        } else {
            setCurrentPrice(null);
        }
    }, [selectedCrypto]); 

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

            const historyRes = await axios.get(
                `http://localhost:5001/api/transactions/history/${loggedInUser.username}`
           )
           setTransactionHistory(historyRes.data)
        } catch (error) {
            console.error('Error fetching portfolio:', error)
        }
    }

    const handleSellClick = (crypto) => {
        setSelectedCrypto(crypto)
        setSellAmount('')
        setTransactionHistory([])
    }

    const confirmSell = async () => {
        if (!sellAmount || isNaN(sellAmount) || parseFloat(sellAmount) <= 0) {
            alert('Please enter a valid amount to sell')
            return
        }

        if (parseFloat(sellAmount) > selectedCrypto.amount) {
            alert('Amount to sell exceeds available amount');
            return;
        }
       if (currentPrice === null) {
            alert('Could not fetch current price. Please try again.');
            return;
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

    const potentialReturn = (sellAmount && currentPrice !== null) ? parseFloat(sellAmount) * currentPrice : 0;


    if (!loggedInUser) {
        return null
    }

    return (
        <div className="myPortfolioContainer">
            <h1>My Portfolio</h1>
            <h2 className="balance">Available Balance (USD): <span>${balance.toFixed(4)}</span></h2>
            

            <div className="holdings">
                <h3>My Holdings</h3>
                {portfolio.length > 0 ? (
                    <div className="cryptoTable">
                        <div className="tableHeader">
                            <div className="headerCell">Coin</div>
                            <div className="headerCell">Amount</div>
                            <div className="headerCell">Avg. Buy Price</div>
                            <div className="headerCell">Actions</div>
                        </div>
                    
                        {portfolio.map((item, index) => (
                        <div className="tableRow" key={index}>
                            <div className="tableCell">{item.cryptoId}</div>
                            <div className="tableCell">{item.amount.toFixed(4)}</div>
                            <div className="tableCell">${item.avgBuyPrice.toFixed(4)}</div>
                            <div className="tableCell">
                                <button onClick={() => handleSellClick(item)} className="sellButton">Sell</button>
                            </div>
                        </div>
                    ))}
                </div>
                ) : (
                    <p className="noHoldings">No Holdings 🤣😂 </p>
                )}
            </div>

            <div className="transactionHistory">
                <h3>Transaction History</h3>
                {transactionHistory.length > 0 ? (
                    <div className="cryptoTable">
                         <div className="tableHeader">
                            <div className="headerCell">Date/Time</div>
                            <div className="headerCell">Type</div>
                            <div className="headerCell">Coin</div>
                            <div className="headerCell">Amount</div>
                            <div className="headerCell">Transaction Price (USD)</div>
                            <div className="headerCell">Value Owned (USD)</div>
                        </div>
                        {transactionHistory.map((transaction) => (
                            <div className="tableRow" key={transaction._id}>
                                <div className="tableCell">{new Date(transaction.timestamp).toLocaleString()}</div>
                                <div className={`tableCell ${transaction.type === 'buy' ? 'positive' : 'negative'}`}>
                                    {transaction.type?.toUpperCase()}
                                </div>
                                <div className="tableCell">{(transaction.cryptoId)}</div>
                                <div className="tableCell">{transaction.amount.toFixed(4)}</div>
                                <div className="tableCell">${transaction.price.toFixed(4)}</div>
                                <div className="tableCell">${transaction.totalValue.toFixed(4)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="noHistory">No transaction history yet.</p>
                )}
            </div>

            {/* Sell Modal */}
            {selectedCrypto && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <h3>Sell {selectedCrypto.cryptoId}</h3>
                        <p>Available: {selectedCrypto.amount.toFixed(4)}</p>
                        
                        <div className="modalInputGroup">
                            <label>Amount to Sell:</label>
                            <input type="number" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} min="0.00001" max={selectedCrypto.amount} step="0.00001" />
                        </div>

                        <p>Potential Return: ${potentialReturn.toFixed(4)}</p>
                        
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
