import express from "express";
import {
	offerRide,
	getMyRides,
	getMyVehicles,
	findRides,
	bookRide,
	cancelBooking,
	getUserBookings,
	getPendingBookings,
	approveBooking,
	rejectBooking,
} from "../controllers/rideController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ride management routes
router.post("/offer-ride", authenticateToken, offerRide);
router.get("/my-rides", authenticateToken, getMyRides);
router.get("/vehicles", authenticateToken, getMyVehicles);
router.get("/find-rides", authenticateToken, findRides);


router.post("/book-ride/:rideId", authenticateToken, bookRide);
router.put("/cancel-booking/:bookingId", authenticateToken, cancelBooking);
router.get("/user-bookings", authenticateToken, getUserBookings);


router.get("/pending-bookings", authenticateToken, getPendingBookings);
router.put("/bookings/:bookingId/approve", authenticateToken, approveBooking);
router.put("/bookings/:bookingId/reject", authenticateToken, rejectBooking);

export default router;
