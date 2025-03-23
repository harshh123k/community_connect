const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Student = require('../models/student');
const Mentor = require('../models/mentor');
const Coordinator = require('../models/coordinator');
const Admin = require('../models/admin');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user in all collections
        let user = await Student.findOne({ email });
        let userType = 'student';

        if (!user) {
            user = await Mentor.findOne({ email });
            userType = 'mentor';
        }

        if (!user) {
            user = await Coordinator.findOne({ email });
            userType = 'coordinator';
        }

        if (!user) {
            user = await Admin.findOne({ email });
            userType = 'admin';
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email, userType },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create reset link
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You have requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user based on type
        let user;
        switch (decoded.userType) {
            case 'student':
                user = await Student.findById(decoded.userId);
                break;
            case 'mentor':
                user = await Mentor.findById(decoded.userId);
                break;
            case 'coordinator':
                user = await Coordinator.findById(decoded.userId);
                break;
            case 'admin':
                user = await Admin.findById(decoded.userId);
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid user type' });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    requestPasswordReset,
    resetPassword
}; 