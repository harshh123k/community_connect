const mongoose = require('mongoose');

function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@somaiya\.edu$/;
    return emailRegex.test(email);
}

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    profile_picture_url: {
        type: String,
        required: false
    },
    email: {
        type: String,
        unique: [true, "Email should be unique"],
        required: [true, "E-mail is mandatory"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: true // Admins are auto-approved
    },
    contact_no: {
        type: String,
        required: [true, "Contact No is required"]
    }
});

module.exports = mongoose.model('Admin', adminSchema);
