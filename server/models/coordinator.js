const mongoose = require('mongoose');

function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@somaiya\.edu$/;
    return emailRegex.test(email);
}

const coordinatorSchema = new mongoose.Schema({
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
        default: false
    },
    contact_no: {
        type: String,
        required: [true, "Contact No is required"]
    },
    department: {
        type: String,
        required: [true, "Department is Required"]
    }
});

module.exports = mongoose.model('Coordinator', coordinatorSchema);
