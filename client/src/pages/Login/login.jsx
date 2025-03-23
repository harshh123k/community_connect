import React, { useState } from "react";
import { url } from "../../Global/URL";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaEnvelope, FaBuilding, FaHandHoldingHeart, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import './login.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${url}/login`, {
                email,
                password
            });

            if (response.data.success) {
                localStorage.setItem('IMPaccessToken', response.data.token);
                localStorage.setItem('userInfo', JSON.stringify(response.data.user));
                
                if (response.data.user.userType === 'volunteer') {
                    navigate('/volunteer/home');
                } else if (response.data.user.userType === 'ngo') {
                    navigate('/ngo/dashboard');
                } else if (response.data.user.userType === 'government') {
                    navigate('/government/dashboard');
                } else {
                    setError('Invalid user type');
                }
            } else {
                setError(response.data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(err.response.data.message || 'Invalid email or password');
            } else if (err.request) {
                // The request was made but no response was received
                setError('No response from server. Please check your connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('An error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>
            
            <div className="login-content">
                <div className="login-header">
                    <div className="icon-wrapper">
                        <FaHandHoldingHeart className="icon-pulse" />
                    </div>
                    <h2 className="welcome-text">Welcome Back</h2>
                    <p className="subtitle">Sign in to continue making a difference in your community</p>
                </div>

                <div className="login-form-container">
                    {error && (
                        <div className="error-message">
                            <FaExclamationCircle />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email address</label>
                            <div className="input-wrapper">
                                <FaEnvelope className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <div className="remember-me">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={loading}
                                />
                                <label htmlFor="remember-me">Remember me</label>
                            </div>

                            <Link to="/forgot-password" className="forgot-password">
                                Forgot your password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`submit-button ${loading ? 'loading' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>

                        <div className="register-section">
                            <div className="divider">
                                <span>New to our community?</span>
                            </div>

                            <div className="register-options">
                                <Link to="/register?type=volunteer" className="register-button volunteer">
                                    <FaUser />
                                    <span>Volunteer</span>
                                </Link>
                                <Link to="/register?type=ngo" className="register-button ngo">
                                    <FaBuilding />
                                    <span>NGO</span>
                                </Link>
                                <Link to="/register?type=government" className="register-button government">
                                    <FaBuilding />
                                    <span>Government</span>
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;