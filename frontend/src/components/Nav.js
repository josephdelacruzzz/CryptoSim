import { Link } from 'react-router-dom'

function Nav( {loggedInUser, setLoggedInUser}) {
    const handleLogout = () => {
        localStorage.removeItem('username')
        localStorage.removeItem('userData')
        setLoggedInUser(null)
        window.location.href = '/'
    }

    return (
        <nav>
            <div className="navLeft">
                <div className="projName">CryptoSim</div>
                <Link to="/">Home</Link>
                <Link to="/profile">User Search</Link>
            </div>

            <div className="navRight">

                {!loggedInUser ? (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                ) : (
                    <>
                        <Link to="/myPortfolio">My Portfolio</Link>
                        <Link to="#" onClick={handleLogout}>Logout</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Nav