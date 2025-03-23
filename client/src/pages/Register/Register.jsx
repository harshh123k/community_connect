import React, { useState, useEffect } from "react";
import { url } from "../../Global/URL";
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaEnvelope, FaBuilding, FaPhone, FaMapMarkerAlt, FaHandHoldingHeart, FaEye, FaEyeSlash, FaExclamationCircle, FaUsers, FaCertificate, FaBriefcase } from 'react-icons/fa';
import { useToast } from '@chakra-ui/react';

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
                <div className="mb-6">
                    <label htmlFor="ngoId" className="block text-sm font-medium text-gray-700 mb-2">
                        Select NGO *
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaHandHoldingHeart className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            name="ngoId"
                            id="ngoId"
                            required
                            value={formData.ngoId}
                            onChange={handleChange}
                            className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            disabled={loading}
                        >
                            <option value="">Select an NGO</option>
                            {ngos && ngos.length > 0 ? (
                                ngos.map((ngo) => (
                                    <option key={ngo._id} value={ngo._id}>
                                        {ngo.name} ({ngo.organization})
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No NGOs available</option>
                            )}
                        </select>
                    </div>
                    {!formData.ngoId && (
                        <p className="mt-1 text-sm text-red-600">
                            Please select an NGO to continue
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                        Areas of Interest
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {interests.map((interest) => (
                            <div key={interest} className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="interests"
                                    value={interest}
                                    checked={formData.interests.includes(interest)}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                    disabled={loading}
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    {interest}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                        Skills
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {skills.map((skill) => (
                            <div key={skill} className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="skills"
                                    value={skill}
                                    checked={formData.skills.includes(skill)}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                    disabled={loading}
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    {skill}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    const renderNGOFields = () => (
        <>
            <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    Organization Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBuilding className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="organization"
                        id="organization"
                        required
                        value={formData.organization}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Enter your organization name"
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                    NGO Registration Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCertificate className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="registrationNumber"
                        id="registrationNumber"
                        required
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Enter your NGO registration number"
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBuilding className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="url"
                        name="website"
                        id="website"
                        required
                        value={formData.website}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Enter your NGO website"
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                    Focus Areas
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    {interests.map((interest) => (
                        <div key={interest} className="flex items-center">
                            <input
                                type="checkbox"
                                name="interests"
                                value={interest}
                                checked={formData.interests.includes(interest)}
                                onChange={handleChange}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                disabled={loading}
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                {interest}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    const renderGovernmentFields = () => (
        <>
            <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    Department
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBuilding className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                        name="department"
                        id="department"
                        required
                        value={formData.department}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        disabled={loading}
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                    Designation
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBriefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="designation"
                        id="designation"
                        required
                        value={formData.designation}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Enter your designation"
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBriefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="number"
                        name="experience"
                        id="experience"
                        required
                        min="0"
                        value={formData.experience}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Enter years of experience"
                        disabled={loading}
                    />
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <FaHandHoldingHeart className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Join Our Community
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Create an account to start making a difference
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                            <FaExclamationCircle className="mr-2" />
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
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

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Enter your full name"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Enter your phone number"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                                </div>
                                <textarea
                                    name="address"
                                    id="address"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Enter your address"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {userType === 'volunteer' && renderVolunteerFields()}
                        {userType === 'ngo' && renderNGOFields()}
                        {userType === 'government' && renderGovernmentFields()}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-5 w-5" />
                                        ) : (
                                            <FaEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="flex items-center space-x-2">
                                    <div className={`h-1 w-1/5 rounded ${getPasswordStrength(formData.password) >= 1 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                                    <div className={`h-1 w-1/5 rounded ${getPasswordStrength(formData.password) >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                                    <div className={`h-1 w-1/5 rounded ${getPasswordStrength(formData.password) >= 3 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                                    <div className={`h-1 w-1/5 rounded ${getPasswordStrength(formData.password) >= 4 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    <div className={`h-1 w-1/5 rounded ${getPasswordStrength(formData.password) >= 5 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters
                                </p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Confirm your password"
                                    disabled={loading}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        {showConfirmPassword ? (
                                            <FaEyeSlash className="h-5 w-5" />
                                        ) : (
                                            <FaEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Creating account...' : 'Create account'}
                            </button>
                        </div>

                        <div className="text-sm text-center">
                            <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register; 