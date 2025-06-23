import { useState } from 'react'
import './Login.css'
import loginPageImage from '../../assets/login-page-image.png';
import { href } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function SignUp() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmP, setConfirmP] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        setError(null);
        if (!username.trim() || !password.trim() || !email.trim() || !confirmP.trim()) {
            setError("All fields must be filled");
            return;
        }
        if (password != confirmP) {
            setError("Please make sure both passwords are the same");
            return;
        }
        setUsername(username.trim());
        setPassword(password.trim());
        try {
            const response = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Signup failed");
            }

            const data = await response.json();
            console.log("SignUp successful:", data);
            toast.success("Registration successful!");
            navigate("/login");
        } catch (error) {
            setError(error.message);
        }
    }
    return (
        <div className='loginPage'>
            <img src={loginPageImage} className='regBackgroundImage' alt="Vite logo" />
            <div className="right-half-rectangle">
                <div className="loginContainer">
                    <div className='textRoadMap'>ROADMAP</div>
                    <div className='textWelcome'>Create your account!</div>
                    <div className="loginInput">
                        <input 
                            type="text" 
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="loginInput">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="loginInput">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="loginInput">
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            value={confirmP} 
                            onChange={(e) => setConfirmP(e.target.value)}
                        />
                    </div>
                    <div className="error">{error}</div>
                    <div>
                        <button className='loginButton' onClick={handleSignUp}>Sign Up</button>
                    </div>
                    <div className="signupText">
                        Already have an account? <a href="/login" className="signupLink">Login</a>
                    </div>
                </div>
            </div>
        </div>
    );
}    

export default SignUp
