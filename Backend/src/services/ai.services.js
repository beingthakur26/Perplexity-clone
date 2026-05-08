import { ChatGoogle } from "@langchain/google";
import dotenv from "dotenv";
dotenv.config();

const model = new ChatGoogle({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash",
});

export const getAiResponse = async (prompt) => {
    try {
        const response = await model.invoke(prompt);
        return response.content;
    } catch (err) {
        console.error("Error generating AI response:", err);
        throw err;
    }
};


