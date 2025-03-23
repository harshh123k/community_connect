const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        unique: [true, "Email should be unique"],
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"]
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    organization: {
        type: String,
        required: [true, "Organization name is required"]
    },
    registrationNumber: {
        type: String,
        required: [true, "NGO registration number is required"]
    },
    website: {
        type: String,
        required: [true, "Website URL is required"]
    },
    interests: [{
        type: String,
        required: false
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NGO', ngoSchema); 