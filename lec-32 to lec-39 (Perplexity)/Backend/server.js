import dotenv from "dotenv";
import dns from 'node:dns';
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
// import { getAiResponse } from "./src/services/ai.services.js";

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

// getAiResponse("hello")

/**
 * @description Connect to MongoDB and start the server
 */
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });
    })
    .catch((err) => {
        console.log("MONGODB connection FAILED ", err);
    });
