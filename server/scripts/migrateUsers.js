const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config({ path: '../config.env' });
const Student = require('../models/student');
const Mentor = require('../models/mentor');
const Coordinator = require('../models/coordinator');
const Admin = require('../models/admin');

const DEFAULT_PASSWORD = 'Welcome@123'; // This will be the temporary password for all users

async function migrateUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Hash the default password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        // Update all students
        const students = await Student.find({ password: { $exists: false } });
        for (const student of students) {
            student.password = hashedPassword;
            await student.save();
            console.log(`Updated student: ${student.email}`);
        }

        // Update all mentors
        const mentors = await Mentor.find({ password: { $exists: false } });
        for (const mentor of mentors) {
            mentor.password = hashedPassword;
            await mentor.save();
            console.log(`Updated mentor: ${mentor.email}`);
        }

        // Update all coordinators
        const coordinators = await Coordinator.find({ password: { $exists: false } });
        for (const coordinator of coordinators) {
            coordinator.password = hashedPassword;
            await coordinator.save();
            console.log(`Updated coordinator: ${coordinator.email}`);
        }

        // Update all admins
        const admins = await Admin.find({ password: { $exists: false } });
        for (const admin of admins) {
            admin.password = hashedPassword;
            await admin.save();
            console.log(`Updated admin: ${admin.email}`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateUsers(); 