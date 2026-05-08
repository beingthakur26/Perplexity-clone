/**
 * @description Custom Error class to handle API-specific errors.
 * Extends the native Error class with statusCode and success status.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} message - The error message.
 * @param {Array} errors - The array of errors.
 * @param {string} stack - The stack trace.
 */
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
