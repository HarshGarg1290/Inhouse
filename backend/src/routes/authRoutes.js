import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import upload from "../uploads/multerConfig.js";

const router = express.Router();

router.post(
	"/register",
	upload.fields([
		{ name: "panProof", maxCount: 1 },
		{ name: "aadharProof", maxCount: 1 },
	]),
	registerUser
);
router.post("/login", loginUser);

export default router;
