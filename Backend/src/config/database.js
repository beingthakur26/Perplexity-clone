import mongoose from "mongoose";

/**
 * Connects to MongoDB using URI from environment variables.
 * Includes basic validation and connection status logging.
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        const connectionInstance = await mongoose.connect(mongoURI);

        console.log(`\n✅ MongoDB connected!`);
        console.log(`🔹 DB NAME: ${connectionInstance.connection.name}`);

    } catch (error) {
        console.error("❌ MONGODB connection FAILED:");
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;
