const express = require('express');
const router = express.Router();
const { login, register, logout, approveUser } = require('../controllers/auth');
const { requestPasswordReset, resetPassword } = require('../controllers/passwordReset');
const { body } = require('express-validator');

// Validation middleware
const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
    body('address').notEmpty().withMessage('Address is required'),
    body('userType').isIn(['volunteer', 'ngo', 'government']).withMessage('Invalid user type'),
    // Additional validation based on user type
    body('interests').if(body('userType').equals('volunteer')).isArray().withMessage('Please select at least one interest'),
    body('skills').if(body('userType').equals('volunteer')).isArray().withMessage('Please select at least one skill'),
    body('registrationNumber').if(body('userType').equals('ngo')).notEmpty().withMessage('NGO registration number is required'),
    body('website').if(body('userType').equals('ngo')).isURL().withMessage('Please enter a valid website URL'),
    body('department').if(body('userType').equals('government')).notEmpty().withMessage('Department is required'),
    body('designation').if(body('userType').equals('government')).notEmpty().withMessage('Designation is required'),
    body('experience').if(body('userType').equals('government')).isInt({ min: 0 }).withMessage('Experience must be a positive number')
];

const resetPasswordValidation = [
    body('email').isEmail().withMessage('Please enter a valid email')
];

const newPasswordValidation = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
];

// Routes
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.post('/logout', logout);
router.post('/approve-user', approveUser);

// Password reset routes
router.post('/forgot-password', resetPasswordValidation, requestPasswordReset);
router.post('/reset-password', newPasswordValidation, resetPassword);

module.exports = router; 