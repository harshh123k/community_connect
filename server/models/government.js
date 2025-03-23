const mongoose = require('mongoose');

const governmentSchema = new mongoose.Schema({
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
    department: {
        type: String,
        required: [true, "Department is required"]
    },
    designation: {
        type: String,
        required: [true, "Designation is required"]
    },
    experience: {
        type: Number,
        required: [true, "Years of experience is required"],
        min: 0
    },
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

module.exports = mongoose.model('Government', governmentSchema); 