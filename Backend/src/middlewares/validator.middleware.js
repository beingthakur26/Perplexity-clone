import { validationResult } from "express-validator";

/**
 * @description Reusable middleware to handle validation results.
 * If there are errors, it returns a 400 response with the error details.
 * Otherwise, it proceeds to the next middleware/controller.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();  
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: extractedErrors
    });
};

export { validate };
