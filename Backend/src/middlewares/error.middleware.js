import { ApiError } from "../utils/ApiError.js";

/**
 * @description Global Express error-handling middleware.
 * It catches all errors and returns a standardized JSON response.
 */
const errorHandler = (err, req, res, next) => {
    // 1. If error is an instance of ApiError, use its properties
    // 2. Otherwise, treat it as a generic 500 error
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    const errors = err.errors || [];

    return res.status(statusCode).json({
        success: false,
        message,
        errors,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};

export { errorHandler };
