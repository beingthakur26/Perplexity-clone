import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

/**
 * Send token in cookie
 * @param {Object} user - The user object.
 * @param {number} statusCode - The HTTP status code.
 * @param {Object} res - The response object.
 * @param {string} message - The success message.
 */
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = user.generateToken();

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,                                          // JS can't access this cookie (prevents XSS)
        secure: process.env.NODE_ENV === "production",           // HTTPS only in production
        sameSite: "strict"                                       // Prevents CSRF attacks
    };

    user.password = undefined;

    res.status(statusCode)
        .cookie("token", token, cookieOptions)
        .json({
            success: true,
            message,
            data: user
        });
};

const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    // 1. Check if token is provided in the URL query string
    if (!token) {
        throw new ApiError(400, "Verification token is missing");
    }

    // 2. Decode the JWT token — only catch JWT errors here, not ApiErrors
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        // Only jwt.verify failures should land here (expired / malformed token)
        throw new ApiError(400, "Invalid or expired verification token");
    }

    // 3. Find the user in the database using the decoded ID
    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(404, "User not found for this token");
    }

    // 4. Handle edge case: User clicks the link after already verifying
    if (user.emailVerified) {
        return res.status(200).send("<h1>Email is already verified. You can proceed to login.</h1>");
    }

    // 5. Mark the user's email as verified and save it to the DB
    user.emailVerified = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).send("<h1>Email Verified Successfully! You can now login.</h1>");
});

/**
 * REGISTER USER
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // ✅ Basic validation (don’t skip this)
    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // ✅ Check existing user
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(400, "User already exists");
    }

    // ✅ Create user
    const user = await User.create({
        fullName,
        email,
        username,
        password,
        emailVerified: false // Explicitly false initially
    });

    if (!user) {
        throw new ApiError(500, "User registration failed");
    }

    // Generate verify token
    const verifyToken = user.generateToken();
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/auth/verify-email?token=${verifyToken}`;

    // 🔗 DEV LOG: Print link to terminal so user can verify without email working
    console.log("\n--------------------------------------------------");
    console.log("🔗 DEV VERIFICATION LINK (Copy to browser):");
    console.log(verificationUrl);
    console.log("--------------------------------------------------\n");

    // ✅ Send email (DON'T BREAK FLOW)
    sendEmail({
        to: user.email,
        subject: "Verify your email - Perplexity",
        html: `
        <h1>Welcome to our Platform</h1>
        <p>Hi ${user.fullName}, please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <br><br>
        <p>Or copy and paste this link in your browser: <br> ${verificationUrl}</p>
        `
    }).catch(err => {
        console.error("❌ Email failed to send:", err.message);
    });

    // ✅ Send token (better UX)
    sendTokenResponse(user, 201, res, "User registered successfully! Please check your email (or terminal) to verify your account.");
});

/**
 * LOGIN USER
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // 2. Find exactly which user is attempting to login
    const user = await User.findOne({ email });

    // 3. Check if user exists & verify password matches the hash stored in DB
    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    // 4. PREVENT LOGIN IF EMAIL IS NOT VERIFIED
    if (!user.emailVerified) {
        throw new ApiError(403, "Please verify your email before logging in. Check your inbox for the verification link.");
    }

    // 5. Send cookie containing the auth token
    sendTokenResponse(user, 200, res, "User logged in successfully!");
});

/**
 * GET CURRENT USER
 * @route GET /api/auth/me
 * @access Private (requires verifyJWT middleware)
 */
const getMe = asyncHandler(async (req, res) => {
    // req.user is already attached by the verifyJWT middleware
    // We just return it — no DB call needed (verifyJWT already fetched it)
    res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: req.user
    });
});

/**
 * LOGOUT USER
 * @route POST /api/auth/logout
 * @access Private (requires verifyJWT middleware)
 */
const logoutUser = asyncHandler(async (req, res) => {
    // Forcefully expire the token cookie by setting it to an empty string
    // and setting expiry to the past (immediate expiry)
    res.cookie("token", "", {
        expires: new Date(0),  // Expired immediately — browser will delete it
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

/**
 * FORGOT PASSWORD — Step 1: Request a password reset email
 * @route POST /api/auth/forgot-password
 * @access Public
 * @body { email }
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    // ✅ Security: Always return success even if user doesn't exist
    //    This prevents email enumeration attacks (someone guessing if an email is registered)
    if (!user) {
        return res.status(200).json({
            success: true,
            message: "If an account with that email exists, a reset link has been sent"
        });
    }

    // Generate a short-lived reset token (15 minutes only)
    const resetToken = jwt.sign(
        { _id: user._id, purpose: "password-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }  // Short expiry for security
    );

    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password?token=${resetToken}`;

    await sendEmail({
        to: user.email,
        subject: "Password Reset Request - Perplexity",
        html: `
        <h1>Password Reset</h1>
        <p>Hi ${user.fullName},</p>
        <p>You requested a password reset. Click the link below (valid for 15 minutes):</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <br><br>
        <p>If you didn't request this, please ignore this email. Your password will stay the same.</p>
        `
    });

    res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent"
    });
});

/**
 * RESET PASSWORD — Step 2: Submit new password using the token from email
 * @route POST /api/auth/reset-password
 * @access Public
 * @query { token }
 * @body  { password }
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;

    if (!token) {
        throw new ApiError(400, "Reset token is missing");
    }

    if (!password || password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    // Decode and verify the reset token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new ApiError(400, "Reset link is invalid or has expired. Please request a new one.");
    }

    // Extra check: ensure the token was specifically created for password reset
    if (decoded.purpose !== "password-reset") {
        throw new ApiError(400, "Invalid reset token");
    }

    const user = await User.findById(decoded._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Update password — the pre('save') hook will auto-hash it
    user.password = password;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successfully! You can now login with your new password."
    });
});

/**
 * RESEND VERIFICATION EMAIL
 * @route POST /api/auth/resend-verification
 * @access Public
 * @body { email }
 */
const resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "No account found with this email");
    }

    // Don't resend if already verified
    if (user.emailVerified) {
        return res.status(400).json({
            success: false,
            message: "This email is already verified. Please login."
        });
    }

    // Generate a fresh verification token
    const verifyToken = user.generateToken();
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/auth/verify-email?token=${verifyToken}`;

    await sendEmail({
        to: user.email,
        subject: "Verify your email - Perplexity (Resent)",
        html: `
        <h1>Email Verification</h1>
        <p>Hi ${user.fullName}, here's your new verification link:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <br><br>
        <p>Or paste this in your browser: <br>${verificationUrl}</p>
        `
    });

    res.status(200).json({
        success: true,
        message: "Verification email resent! Please check your inbox."
    });
});

export { registerUser, loginUser, verifyEmail, getMe, logoutUser, forgotPassword, resetPassword, resendVerificationEmail };




