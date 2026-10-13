import User from "../models/userModel.js";

import { generateToken, tokenVerification } from "../utils/generateToken.js";

import AppError from "../utils/AppError.js";

import sendEmail from "../utils/email.js";

// Create & Send JWT Token
const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  return res.status(statusCode).json({
    status: "success",
    token,
  });
};

export async function signup(req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
  });

  createSendToken(newUser, 201, res);
}

export async function login(req, res, next) {
  const { email, password } = req.body;

  // check if email and password Exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // check if the user Exist + the password is Correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // return the token
  createSendToken(user, 200, res);
}

export function logout() {}

export async function protect(req, res, next) {
  // 1) Check if token exists
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || token === "undefined") {
    return next(
      new AppError("You are not logged in. Please log in to get access.", 401),
    );
  }

  console.log("AUTH HEADER:", req.headers.authorization);
  console.log("TOKEN:", token);
  console.log("TOKEN PARTS:", token?.split(".").length);

  // 2) Verify token
  const { id, iat } = tokenVerification(token);

  // 3) Check if user still exists
  const freshUser = await User.findById(id);

  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  // 4) Check if the user hasn't changed password
  if (freshUser.changePasswordAfter(iat)) {
    throw new AppError(
      "User recently changed password. Please log in again.",
      401,
    );
  }

  // Grant Access
  req.user = freshUser;
  next();
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
}

export function isLoggedIn() {}

export async function forgotPassword(req, res, next) {
  // 1- Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with email address", 404));
  }

  // 2- Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3- Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (Valid for10 min)",
      message: `${resetURL}`,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
}

export async function resetPassword() {
  // 1) get the user Based on the Token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If Token is not expired, and there is a user, set a new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) update changePasswordAt

  // 4) log the User in and send the jwt
  createSendToken(user, 200, res);
}

export async function updatePassword(req, res, next) {
  // 1) get user
  const user = await User.findById(req.user.id).select("+password");

  if (!user) return next("there is no user", 404);

  // 2) check if the password is Correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your password is wrong", 401));
  }

  // 3) if so update the user Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4) log user
  createSendToken(user, 200, res);
}
