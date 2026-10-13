import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please Tell me Your Name"] },
  email: {
    type: String,
    required: [true, "Please Provide Your Email"],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, "Email must be at most 100 characters"],
    match: [/^\S+@\S+\.\S+$/, "Please Provide a Valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Provide a Password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please Provide a Password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },
  phone: {
    type: String,
    required: [true, "Please Provide Your Phone Number"],
    trim: true,
    match: [
      /^01[0125][0-9]{8}$/,
      "Please Provide a Valid Egyptian Phone Number",
    ],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

// For Signup
userSchema.pre("save", async function () {
  // Only if the Password Modified
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

// For Login
userSchema.methods.correctPassword = async function (
  candidatePassword,
  password,
) {
  return await bcrypt.compare(candidatePassword, password);
};

// For Protect
userSchema.methods.changePasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTtimestamp < passwordChangedTime;
  }
  // dosent change it
  return false;
};

// For forgot Password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// For Reset Password
userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

const User = mongoose.model("User", userSchema);

export default User;
