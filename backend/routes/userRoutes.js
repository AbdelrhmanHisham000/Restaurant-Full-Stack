import express from "express";
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  restrictTo,
  signup,
  updatePassword,
} from "../controllers/authController.js";
import catchAsync from "../utils/catchAsync.js";
import { getMe, getUser } from "../controllers/userController.js";
const router = express.Router();

router.post("/signup", catchAsync(signup));
router.post("/login", catchAsync(login));
router.post("/forgotPassword", catchAsync(forgotPassword));
router.patch("/resetPassword/:token", catchAsync(resetPassword));
router.patch("/updatePassword", protect, catchAsync(updatePassword));

router.get("/me", protect, catchAsync(getMe));
router.get("/:id", protect, restrictTo("admin"), catchAsync(getUser));
export default router;
