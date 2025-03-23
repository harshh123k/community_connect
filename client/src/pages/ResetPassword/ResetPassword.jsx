import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../Global/URL';
import { FaEye, FaEyeSlash, FaCheck, FaTimes, FaLock, FaLockOpen } from 'react-icons/fa';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validToken, setValidToken] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    useEffect(() => {
        // Verify token when component mounts
        const verifyToken = async () => {
            try {
                await axios.post(`${url}/auth/verify-token`, { token });
                setValidToken(true);
            } catch (error) {
                setValidToken(false);
                setError('Invalid or expired reset link. Please request a new one.');
                setTimeout(() => {
                    navigate('/forgot-password');
                }, 3000);
            }
        };

        verifyToken();
    }, [token, navigate]);

    const validatePassword = (password) => {
        setPasswordStrength({
            hasMinLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setNewPassword(password);
        validatePassword(password);
    };

    const isPasswordValid = () => {
        return Object.values(passwordStrength).every(Boolean);
    };

    const getPasswordStrengthScore = () => {
        const requirements = Object.values(passwordStrength);
        const metRequirements = requirements.filter(Boolean).length;
        return Math.round((metRequirements / requirements.length) * 100);
    };

    const getStrengthColor = (score) => {
        if (score <= 20) return 'bg-red-500';
        if (score <= 40) return 'bg-orange-500';
        if (score <= 60) return 'bg-yellow-500';
        if (score <= 80) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = (score) => {
        if (score <= 20) return 'Very Weak';
        if (score <= 40) return 'Weak';
        if (score <= 60) return 'Medium';
        if (score <= 80) return 'Strong';
        return 'Very Strong';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid()) {
            setError('Please ensure your password meets all requirements');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${url}/auth/reset-password`, {
                token,
                newPassword
            });

            if (response.data.success) {
                // Redirect to login page after successful password reset
                navigate('/login', { 
                    state: { message: 'Password reset successful. Please login with your new password.' }
                });
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!validToken) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center text-red-600">
                            {error}
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/forgot-password')}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Request New Reset Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const strengthScore = getPasswordStrengthScore();
    const strengthColor = getStrengthColor(strengthScore);
    const strengthText = getStrengthText(strengthScore);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Please enter your new password below.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={newPassword}
                                    onChange={handlePasswordChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm pr-10"
                                    placeholder="Enter new password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {newPassword && (
                                <div className="mt-2">
                                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${strengthColor} transition-all duration-300`}
                                            style={{ width: `${strengthScore}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-gray-500">
                                            Password Strength: {strengthText}
                                        </p>
                                        <p className="text-xs font-medium" style={{ color: strengthColor }}>
                                            {strengthScore}%
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="mt-2 text-sm text-gray-600">
                                <p className={`flex items-center ${passwordStrength.hasMinLength ? "text-green-600" : "text-gray-500"}`}>
                                    {passwordStrength.hasMinLength ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                                    At least 8 characters long
                                </p>
                                <p className={`flex items-center ${passwordStrength.hasUpperCase ? "text-green-600" : "text-gray-500"}`}>
                                    {passwordStrength.hasUpperCase ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                                    Contains at least one uppercase letter
                                </p>
                                <p className={`flex items-center ${passwordStrength.hasLowerCase ? "text-green-600" : "text-gray-500"}`}>
                                    {passwordStrength.hasLowerCase ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                                    Contains at least one lowercase letter
                                </p>
                                <p className={`flex items-center ${passwordStrength.hasNumber ? "text-green-600" : "text-gray-500"}`}>
                                    {passwordStrength.hasNumber ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                                    Contains at least one number
                                </p>
                                <p className={`flex items-center ${passwordStrength.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}>
                                    {passwordStrength.hasSpecialChar ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                                    Contains at least one special character
                                </p>
                                <p className="text-xs text-gray-500 ml-4">
                                    (!@#$%^&*(),.?":{}|&lt;&gt;)
                                </p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm pr-10"
                                    placeholder="Confirm new password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {confirmPassword && (
                                <div className="mt-1 flex items-center text-sm">
                                    {newPassword === confirmPassword ? (
                                        <span className="text-green-600 flex items-center">
                                            <FaCheck className="mr-1" />
                                            Passwords match
                                        </span>
                                    ) : (
                                        <span className="text-red-600 flex items-center">
                                            <FaTimes className="mr-1" />
                                            Passwords do not match
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !isPasswordValid() || newPassword !== confirmPassword}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                    (loading || !isPasswordValid() || newPassword !== confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword; 