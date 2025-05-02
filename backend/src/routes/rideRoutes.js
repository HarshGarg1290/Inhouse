import express from "express";
import { offerRide, getMyRides, getMyVehicles } from "../controllers/rideController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/offer-ride", authenticateToken, offerRide);
router.get("/my-rides", authenticateToken, getMyRides);
router.get("/vehicles", authenticateToken, getMyVehicles);

export default router;
