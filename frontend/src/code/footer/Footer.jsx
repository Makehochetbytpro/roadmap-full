import { useNavigate } from "react-router-dom";
import './Footer.css';
import logoLight from '../../assets/logo-white.png';
import linksIcon from '../../assets/links.png';

function Footer() {
    const navigate = useNavigate();

    const navigateToHome = () => {
        navigate('/'); 
    };
    const navigateToAboutUs = () => {
        navigate('/aboutus'); 
    };
    const navigateToCategory = (category) => {
        navigate(`/category/${category.toLowerCase()}`); 
    };

    return (
        <div style={{backgroundColor: '#1d242c'}}>
            <div className="footer">
                <div className='footer-logo'>
                    <div>
                        <img src={logoLight} className='footer-logo-image' alt="Learning Platform Logo" />
                        <hr className="footer-divider" />
                    </div>
                    <div className="footer-logo-text">Your future is waiting, take your first step</div>
                </div>
                <div className='footer-links'>
                    <div className="footer-links-title">Quick Links</div>
                    <div className='footer-link' onClick={navigateToHome}><img src={linksIcon} className="links-icon"></img> Home</div>
                    <div className='footer-link' onClick={navigateToAboutUs}><img src={linksIcon} className="links-icon"></img> About Us</div>
                    <div className='footer-link'><img src={linksIcon} className="links-icon"></img> Service Terms</div>
                </div>
                <div className='footer-categories'>
                    <div className='footer-categories-title'>Categories</div>
                    <div className='footer-category' onClick={() => navigateToCategory('Programming')}>Programming</div>
                    <div className='footer-category' onClick={() => navigateToCategory('Music')}>Music</div>
                    <div className='footer-category' onClick={() => navigateToCategory('Art')}>Art</div>
                </div>
                <div className='footer-contacts'>
                    <div className='footer-contacts-title'>Contact us</div>
                    <div className='footer-contact-item'>Email: info@learningplatform.com</div>
                    <div className='footer-contact-item'>Phone: +1 (555) 123-4567</div>
                    <div className='footer-contact-item'>Address: 123 Learning St, Knowledge City</div>
                </div>
            </div>
            <div className='footer-copyright'>
                    © 2025 Learning Platform. All rights reserved.
            </div>
        </div>
    );
}

export default Footer;