import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

/**
 * @description Protects routes by verifying the JWT from cookie.
 *              On success, attaches the full user object to req.user.
 * @usage       Place before any controller you want to make private.
 *              e.g. router.get("/me", verifyJWT, getMe)
 */
const verifyJWT = asyncHandler(async (req, res, next) => {
    // 1. Read the token from the httpOnly cookie set during login/register
    const token = req.cookies?.token;

    if (!token) {
        throw new ApiError(401, "Unauthorized — please login first");
    }

    // 2. Verify the token signature using the same secret used to sign it
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired session — please login again");
    }

    // 3. Fetch the latest user from DB (catches cases where user was deleted after login)
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
        throw new ApiError(401, "User belonging to this token no longer exists");
    }

    // 4. Attach user to the request object for downstream controllers to use
    req.user = user;

    next();
});

export { verifyJWT };
