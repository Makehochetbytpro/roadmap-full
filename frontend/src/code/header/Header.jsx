import { useEffect, useState } from "react";
import './Header.css'
import { Link, useNavigate } from "react-router-dom";
import logoDark from '../../assets/logo.png';
import logoLight from '../../assets/logo-white.png';

function Header({mode}) {
    const color = mode == "dark" ? logoDark : logoLight;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const navigateToHome = () => {
        navigate('/'); 
    };
    const navigateToAboutUs = () => {
        navigate('/aboutus'); 
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
        console.log(token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login");
    };

    return (
        <>
            <header className={`header ${mode}`}>
                <div className='header-container'>
                    <img src={color} className='web-icon'></img>
                    <div className='links-container'>
                        <a className='header-links' onClick={navigateToHome}>Home</a>
                        <a className='header-links' onClick={navigateToAboutUs}>About Us</a>
                        <a className='header-links'>Service Terms</a>
                    </div>
                    {isLoggedIn ? <button onClick={handleLogout} className="logout">Logout</button> : <a className='login' href='/login'>Log in</a>}
                </div>
            </header>
        </>
    )
}

export default Header;