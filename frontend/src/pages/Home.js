import { useState, useEffect} from 'react'
import axios from 'axios'

function Home() {
    const [cryptos, setCryptos] = useState([])

    useEffect(() => {
        axios.get('http://localhost:5001/api/crypto')
        .then(response => setCryptos(response.data))
        .catch(error => console.error('Error:', error))
    }, [])

    return (
        <div className="homeContainer">
            <h1 className="marketTitle"> Crypto Market </h1>
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
                            <button className="buyButton">Buy</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home