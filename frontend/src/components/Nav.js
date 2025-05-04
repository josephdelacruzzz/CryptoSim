import { Link } from 'react-router-dom'

function Nav( {loggedInUser, setLoggedInUser}) {
    const handleLogout = () => {
        localStorage.removeItem('currentUser')
        setLoggedInUser(null)
        window.location.href = '/'
    }

    return (
        <nav>
            <div className="navLeft">
                <Link to="/">Home</Link>
                <Link to="/profile">Profile Searcher</Link>
            </div>

            <div className="navRight">

                {!loggedInUser ? (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                ) : (
                    <>
                        <Link to="#" onClick={handleLogout}>Logout</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Nav