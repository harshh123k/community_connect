import React, { useState, useEffect } from "react";
import { url } from "../../Global/URL";
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaEnvelope, FaBuilding, FaPhone, FaMapMarkerAlt, FaHandHoldingHeart, FaEye, FaEyeSlash, FaExclamationCircle, FaUsers, FaCertificate, FaBriefcase } from 'react-icons/fa';
import { useToast } from '@chakra-ui/react';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        organization: '',
        address: '',
        interests: [],
        registrationNumber: '',
        website: '',
        department: '',
        designation: '',
        experience: '',
        skills: [],
        ngoId: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userType, setUserType] = useState(searchParams.get('type') || 'volunteer');
    const [ngos, setNgos] = useState([]);

    console.log('Current user type:', userType);
    console.log('Current NGOs:', ngos);

    const interests = [
        'Education', 'Healthcare', 'Environment', 'Poverty Alleviation', 
        'Women Empowerment', 'Child Welfare', 'Disaster Relief', 
        'Community Development', 'Animal Welfare', 'Human Rights'
    ];

    const skills = [
        'Project Management', 'Community Outreach', 'Fundraising', 
        'Event Planning', 'Teaching', 'Healthcare', 'Legal Aid', 
        'Environmental Conservation', 'Social Media Management', 
        'Public Speaking', 'Research', 'Data Analysis'
    ];

    const departments = [
        'Education', 'Healthcare', 'Environment', 'Social Welfare', 
        'Women & Child Development', 'Rural Development', 'Urban Development',
        'Disaster Management', 'Employment', 'Housing'
    ];

    useEffect(() => {
        const fetchNGOs = async () => {
            try {
                console.log('Fetching NGOs for user type:', userType);
                const response = await axios.get(`${url}/ngo/all`);
                console.log('NGOs API response:', response);
                console.log('NGOs data:', response.data);
                
                if (response.data.success) {
                    // Filter only approved NGOs
                    const approvedNGOs = response.data.ngos.filter(ngo => ngo.isApproved);
                    console.log('Filtered approved NGOs:', approvedNGOs);
                    console.log('Number of approved NGOs:', approvedNGOs.length);
                    setNgos(approvedNGOs);
                } else {
                    console.error('Failed to fetch NGOs:', response.data.message);
                    setError('Failed to load NGO list. Please try again later.');
                }
            } catch (error) {
                console.error('Error fetching NGOs:', error);
                console.error('Error details:', error.response?.data);
                setError('Failed to load NGO list. Please try again later.');
            }
        };

        if (userType === 'volunteer') {
            console.log('User type is volunteer, fetching NGOs...');
            fetchNGOs();
        } else {
            console.log('User type is not volunteer, clearing NGOs');
            setNgos([]);
        }
    }, [userType]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log('Form field changed:', name, value);
        
        if (type === 'checkbox') {
            const field = name === 'interests' ? 'interests' : 'skills';
            setFormData(prev => ({
                ...prev,
                [field]: checked 
                    ? [...prev[field], value]
                    : prev[field].filter(item => item !== value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            // Validate NGO selection for volunteers
            if (userType === 'volunteer' && !formData.ngoId) {
                setError('Please select an NGO');
                setLoading(false);
                return;
            }

            // Prepare registration data based on user type
            const registrationData = {
                ...formData,
                userType
            };

            // Remove confirmPassword from the data
            delete registrationData.confirmPassword;

            console.log('Sending registration data:', registrationData);

            const response = await axios.post(`${url}/register`, registrationData);

            if (response.data.success) {
                // Store user info in localStorage
                localStorage.setItem('userInfo', JSON.stringify({
                    id: response.data.user._id,
                    email: response.data.user.email,
                    name: response.data.user.name,
                    userType: response.data.user.userType
                }));

                // Show success message
                toast({
                    title: 'Registration Successful',
                    description: 'Your account has been created successfully.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });

                // Redirect based on user type
                switch (userType) {
                    case 'volunteer':
                        navigate('/volunteer/home');
                        break;
                    case 'ngo':
                        navigate('/ngo/dashboard');
                        break;
                    case 'government':
                        navigate('/government/dashboard');
                        break;
                    default:
                        navigate('/login');
                }
            } else {
                setError(response.data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderVolunteerFields = () => {
        console.log('Rendering volunteer fields');
        console.log('Available NGOs:', ngos);
        return (
            <>
                <div className="form-group">
                    <label htmlFor="ngoId">Select NGO</label>
                    <div className="input-wrapper">
                        <FaHandHoldingHeart className="input-icon" />
                        <select
                            name="ngoId"
                            id="ngoId"
                            required
                            value={formData.ngoId}
                            onChange={handleChange}
                            disabled={loading}
                            className="select-input"
                        >
                            <option value="">Select an NGO</option>
                            {ngos.map((ngo) => (
                                <option key={ngo._id} value={ngo._id}>
                                    {ngo.name} ({ngo.organization})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Areas of Interest</label>
                    <div className="checkbox-grid">
                        {interests.map((interest) => (
                            <div key={interest} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    id={`interest-${interest}`}
                                    name="interests"
                                    value={interest}
                                    checked={formData.interests.includes(interest)}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <label htmlFor={`interest-${interest}`}>{interest}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Skills</label>
                    <div className="checkbox-grid">
                        {skills.map((skill) => (
                            <div key={skill} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    id={`skill-${skill}`}
                                    name="skills"
                                    value={skill}
                                    checked={formData.skills.includes(skill)}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <label htmlFor={`skill-${skill}`}>{skill}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    const renderNGOFields = () => (
        <>
            <div className="form-group">
                <label htmlFor="organization">Organization Name</label>
                <div className="input-wrapper">
                    <FaBuilding className="input-icon" />
                    <input
                        id="organization"
                        name="organization"
                        type="text"
                        required
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="Enter organization name"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="registrationNumber">Registration Number</label>
                <div className="input-wrapper">
                    <FaCertificate className="input-icon" />
                    <input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        required
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        placeholder="Enter registration number"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="website">Website</label>
                <div className="input-wrapper">
                    <FaBuilding className="input-icon" />
                    <input
                        id="website"
                        name="website"
                        type="url"
                        required
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="Enter your NGO website"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Focus Areas</label>
                <div className="checkbox-grid">
                    {interests.map((interest) => (
                        <div key={interest} className="checkbox-item">
                            <input
                                type="checkbox"
                                id={`interest-${interest}`}
                                name="interests"
                                value={interest}
                                checked={formData.interests.includes(interest)}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <label htmlFor={`interest-${interest}`}>{interest}</label>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    const renderGovernmentFields = () => (
        <>
            <div className="form-group">
                <label htmlFor="department">Department</label>
                <div className="input-wrapper">
                    <FaBuilding className="input-icon" />
                    <select
                        name="department"
                        id="department"
                        required
                        value={formData.department}
                        onChange={handleChange}
                        disabled={loading}
                        className="select-input"
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="designation">Designation</label>
                <div className="input-wrapper">
                    <FaBriefcase className="input-icon" />
                    <input
                        id="designation"
                        name="designation"
                        type="text"
                        required
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Enter your designation"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="experience">Years of Experience</label>
                <div className="input-wrapper">
                    <FaBriefcase className="input-icon" />
                    <input
                        id="experience"
                        name="experience"
                        type="number"
                        required
                        min="0"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Enter years of experience"
                        disabled={loading}
                    />
                </div>
            </div>
        </>
    );

    return (
        <div className="register-container">
            <div className="register-background">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>
            
            <div className="register-content">
                <div className="register-header">
                    <div className="icon-wrapper">
                        <FaHandHoldingHeart className="icon-pulse" />
                    </div>
                    <h2 className="welcome-text">Join Our Community</h2>
                    <p className="subtitle">Create an account to start making a difference</p>
                </div>

                <div className="register-form-container">
                    {error && (
                        <div className="error-message">
                            <FaExclamationCircle />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-wrapper">
                                <FaUser className="input-icon" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <FaEnvelope className="input-icon" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-wrapper">
                                <FaPhone className="input-icon" />
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <div className="input-wrapper">
                                <FaMapMarkerAlt className="input-icon" />
                                <textarea
                                    id="address"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Enter your address"
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
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
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

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="password-toggle"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700">
                                I want to register as
                            </label>
                            <div className="mt-2 grid grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setUserType('volunteer')}
                                    className={`py-2 px-4 border rounded-md text-sm font-medium ${
                                        userType === 'volunteer'
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Volunteer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUserType('ngo')}
                                    className={`py-2 px-4 border rounded-md text-sm font-medium ${
                                        userType === 'ngo'
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    NGO
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUserType('government')}
                                    className={`py-2 px-4 border rounded-md text-sm font-medium ${
                                        userType === 'government'
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Government
                                </button>
                            </div>
                        </div>

                        {userType === 'volunteer' && renderVolunteerFields()}
                        {userType === 'ngo' && renderNGOFields()}
                        {userType === 'government' && renderGovernmentFields()}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`submit-button ${loading ? 'loading' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <div className="login-link">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register; 