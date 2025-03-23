const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './config.env' });

async function cleanupDatabase() {
    try {
        // Connect to MongoDB with the full URL
        const mongoUrl = 'mongodb://127.0.0.1:27017/community-portal';
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        // Drop old collections
        const collections = ['students', 'mentors', 'coordinators', 'admins'];
        for (const collection of collections) {
            try {
                await mongoose.connection.collection(collection).drop();
                console.log(`Dropped collection: ${collection}`);
            } catch (error) {
                if (error.code === 26) {
                    console.log(`Collection ${collection} does not exist`);
                } else {
                    console.error(`Error dropping collection ${collection}:`, error);
                }
            }
        }

        console.log('Database cleanup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupDatabase(); 