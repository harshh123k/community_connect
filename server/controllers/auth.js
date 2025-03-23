const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Volunteer = require('../models/volunteer');
const NGO = require('../models/ngo');
const Government = require('../models/government');

const login = async (req, res) => {
    try {
        console.log('Login attempt received:', { email: req.body.email });
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing credentials');
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user in all collections
        let user = await Volunteer.findOne({ email });
        let userType = 'volunteer';

        if (!user) {
            user = await NGO.findOne({ email });
            userType = 'ngo';
        }

        if (!user) {
            user = await Government.findOne({ email });
            userType = 'government';
        }

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        console.log('User found:', { email, userType, isActive: user.isActive, isApproved: user.isApproved });

        // Check if user is active and approved (skip approval check for government accounts)
        if (!user.isActive || (!user.isApproved && userType !== 'government')) {
            console.log('Account not active or approved:', { email, isActive: user.isActive, isApproved: user.isApproved });
            return res.status(401).json({ 
                success: false, 
                message: 'Account is not active or approved. Please wait for admin approval.' 
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                userType: userType
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set refresh token in cookie
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Prepare user data based on user type
        let userData = {
            _id: user._id,
            email: user.email,
            name: user.name,
            userType: userType,
            isActive: user.isActive,
            isApproved: user.isApproved
        };

        // Add type-specific fields
        if (userType === 'ngo') {
            userData = {
                ...userData,
                organization: user.organization,
                registrationNumber: user.registrationNumber,
                website: user.website
            };
        } else if (userType === 'volunteer') {
            userData = {
                ...userData,
                interests: user.interests || [],
                skills: user.skills || []
            };
        } else if (userType === 'government') {
            userData = {
                ...userData,
                department: user.department,
                designation: user.designation
            };
        }

        console.log('Login successful:', { email, userType });
        return res.status(200).json({
            success: true,
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

const register = async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { email, password, name, userType, ...otherData } = req.body;

        // Validate required fields
        if (!email || !password || !name || !userType) {
            console.log('Missing required fields:', { email, name, userType });
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields',
                details: {
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null,
                    name: !name ? 'Name is required' : null,
                    userType: !userType ? 'User type is required' : null
                }
            });
        }

        // Check if user already exists in any collection
        const existingVolunteer = await Volunteer.findOne({ email });
        const existingNGO = await NGO.findOne({ email });
        const existingGovernment = await Government.findOne({ email });

        if (existingVolunteer || existingNGO || existingGovernment) {
            console.log('Email already registered:', email);
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user based on type
        let user;
        switch (userType) {
            case 'volunteer':
                // Validate required fields for volunteer
                if (!otherData.phone || !otherData.address) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields for volunteer',
                        details: {
                            phone: !otherData.phone ? 'Phone number is required' : null,
                            address: !otherData.address ? 'Address is required' : null
                        }
                    });
                }

                user = new Volunteer({
                    email,
                    password: hashedPassword,
                    name,
                    phone: otherData.phone,
                    address: otherData.address,
                    interests: otherData.interests || ['General'],
                    skills: otherData.skills || [],
                    isActive: true,
                    isApproved: false,
                    ngoId: otherData.ngoId || null
                });
                break;
            case 'ngo':
                console.log('Creating new NGO:', { email, name, organization: otherData.organization });
                user = new NGO({
                    email,
                    password: hashedPassword,
                    name,
                    phone: otherData.phone,
                    address: otherData.address,
                    organization: otherData.organization,
                    registrationNumber: otherData.registrationNumber,
                    website: otherData.website,
                    interests: otherData.interests || ['Education', 'Technology'],
                    isActive: true,
                    isApproved: false
                });
                console.log('NGO object created:', user);
                break;
            case 'government':
                user = new Government({
                    email,
                    password: hashedPassword,
                    name,
                    phone: otherData.phone,
                    address: otherData.address,
                    department: otherData.department,
                    designation: otherData.designation,
                    experience: parseInt(otherData.experience),
                    isActive: true,
                    isApproved: true
                });
                break;
            default:
                console.log('Invalid user type:', userType);
                return res.status(400).json({ success: false, message: 'Invalid user type' });
        }

        console.log('Attempting to save user:', { email, userType });
        await user.save();
        console.log('User saved successfully');

        return res.status(201).json({
            success: true,
            message: 'Registration successful. Please wait for approval.',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                userType: userType
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

const logout = (req, res) => {
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const approveUser = async (req, res) => {
    try {
        const { email, userType } = req.body;
        console.log('Approving user:', { email, userType });

        // First, find the user to ensure they exist
        let user;
        switch (userType) {
            case 'volunteer':
                user = await Volunteer.findOne({ email });
                break;
            case 'ngo':
                user = await NGO.findOne({ email });
                break;
            case 'government':
                user = await Government.findOne({ email });
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid user type' });
        }

        if (!user) {
            console.log('User not found:', email);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found',
                details: { email, userType }
            });
        }

        // Now update the user's approval status
        let updateResult;
        switch (userType) {
            case 'volunteer':
                updateResult = await Volunteer.findOneAndUpdate(
                    { email },
                    { $set: { isApproved: true } },
                    { new: true, runValidators: true }
                );
                break;
            case 'ngo':
                updateResult = await NGO.findOneAndUpdate(
                    { email },
                    { $set: { isApproved: true } },
                    { new: true, runValidators: true }
                );
                break;
            case 'government':
                updateResult = await Government.findOneAndUpdate(
                    { email },
                    { $set: { isApproved: true } },
                    { new: true, runValidators: true }
                );
                break;
        }

        if (!updateResult) {
            console.log('Failed to update user:', email);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to approve user',
                details: { email, userType }
            });
        }

        console.log('User approved successfully:', {
            id: updateResult._id,
            email: updateResult.email,
            name: updateResult.name,
            userType: userType,
            isApproved: updateResult.isApproved
        });

        return res.status(200).json({
            success: true,
            message: 'User approved successfully',
            user: {
                id: updateResult._id,
                email: updateResult.email,
                name: updateResult.name,
                userType: userType,
                isApproved: updateResult.isApproved
            }
        });
    } catch (error) {
        console.error('Approval error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = {
    login,
    register,
    logout,
    approveUser
}; 