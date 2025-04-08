import express from "express";
import { offerRide, getMyRides } from "../controllers/rideController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/offer-ride", authenticateToken, offerRide);
router.get("/my-rides", authenticateToken, getMyRides);

export default router;
