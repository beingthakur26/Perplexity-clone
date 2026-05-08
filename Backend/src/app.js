import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"))

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Registering simple routes
/**
 * @description This middleware is used to register all the routes
 * @description All the routes are registered under the /api/auth path
 */
app.use("/api/auth", userRouter);


// Handling 404 for unknown routes
/**
 * @description This middleware is called when no route is found for the given request
 */
app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Registering global error handler (Must be last)
app.use(errorHandler);

export default app;
