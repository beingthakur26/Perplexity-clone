import { Router } from "express";
import {
    registerUser,
    loginUser,
    verifyEmail,
    getMe,
    logoutUser,
    forgotPassword,
    resetPassword,
    resendVerificationEmail
} from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────

/** @route POST /api/auth/register */
router.post("/register", registerValidator, validate, registerUser);

/** @route POST /api/auth/login */
router.post("/login", loginValidator, validate, loginUser);

/** @route GET /api/auth/verify-email?token=... */
router.get("/verify-email", verifyEmail);

/** @route POST /api/auth/forgot-password */
router.post("/forgot-password", forgotPassword);

/** @route POST /api/auth/reset-password?token=... */
router.post("/reset-password", resetPassword);

/** @route POST /api/auth/resend-verification */
router.post("/resend-verification", resendVerificationEmail);


// ─── PRIVATE ROUTES (require login) ─────────────────────────────────────────

/** @route GET /api/auth/me */
router.get("/me", verifyJWT, getMe);

/** @route POST /api/auth/logout */
router.post("/logout", verifyJWT, logoutUser);


export default router;



