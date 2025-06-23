import { useState } from "react";
import "./Login.css";
import loginPageImage from "../../assets/login-page-image.png";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError(null); 
        if (!username.trim() || !password.trim()) {
            setError("Username and password cannot be empty");
            return;
        }
        setUsername(username.trim());
        setPassword(password.trim());
        try {
            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Login failed");
            }

            const data = await response.json();
            localStorage.setItem("token", data.access_token);
            toast.success("Login successful!");
            navigate("/");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="loginPage">
            <img src={loginPageImage} className="regBackgroundImage" alt="Vite logo" />
            <div className="right-half-rectangle">
                <div className="loginContainer">
                    <div className="textRoadMap">ROADMAP</div>
                    <div className="textWelcome">Welcome to our website!</div>
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
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="forgotPassword">
                        <a href="#" className="forgotPasswordLink">Forgot your password?</a>
                    </div>
                    {<div className="error">{error}</div>}
                    <div>
                        <button className="loginButton" onClick={handleLogin}>Login</button>
                    </div>
                    <div className="signupText">
                        Don't have an account? <a href="/signup" className="signupLink">Sign Up</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
