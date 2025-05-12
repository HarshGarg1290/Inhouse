import express from "express";
import {
	getUserDetails,
	getUserVehicles,
	editVehicle,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticateToken, getUserDetails);
router.get("/me/vehicles", authenticateToken, getUserVehicles);
router.put("/vehicles/:vehicleId", authenticateToken, editVehicle);

export default router;
