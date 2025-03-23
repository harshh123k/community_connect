const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
    try {
        console.log("Trying to connect to MongoDB...".green);
        mongoose.set("strictQuery", false);
        
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`.green.bold);
        
    } catch (error) {
        console.log(`Error: ${error.message}`.red.underline);
        process.exit(1); // Exit with failure
    }
};

module.exports = connectDB;