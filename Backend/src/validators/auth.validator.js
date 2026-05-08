import { body } from "express-validator";

/**
 * @description Validation rules for user registration.
 * @route POST /api/auth/register
 * @access public
 */
const registerValidator = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required"),
    
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),

    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

/**
 * @description Validation rules for user login.
 * @route POST /api/auth/login
 * @access public
 */
const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
];

export { registerValidator, loginValidator };
