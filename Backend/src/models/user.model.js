import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            index: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
            index: true
        },
        profilePicture: {
            type: String,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        emailVerified: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
// ✅ No `next` parameter — Mongoose 7+ async hooks resolve via the returned Promise
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return; // Skip hashing if password wasn't changed

    this.password = await bcrypt.hash(this.password, 10);
});

// Custom method to check password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Custom method to generate a JWT token
userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d" // Defaulting to 7 days, adjustable via .env if needed
        }
    );
};

const User = mongoose.model("User", userSchema);

export default User;
