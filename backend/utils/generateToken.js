import jwt from "jsonwebtoken";

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

export function tokenVerification(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
