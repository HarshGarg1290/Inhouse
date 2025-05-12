import prisma from "../utils/prisma.js";

export const offerRide = async (req, res) => {
	try {
		const {
			startLocation,
			destination,
			dateTime,
			seats,
			price,
			vehicleId,
			model,
			color,
			plate,
			preferences,
			startLat,
			startLng,
			desLat,
			desLng,
		} = req.body;

		const user = await prisma.user.findUnique({
			where: { id: req.userId },
			include: { vehicles: true },
		});

		if (!user || user.verificationStatus !== "APPROVED") {
			return res
				.status(403)
				.json({ message: "User is not verified to offer rides." });
		}

		let rideVehicleId = vehicleId;

		if (!vehicleId) {
			const existingVehicle = await prisma.vehicle.findFirst({
				where: { plate },
			});

			if (existingVehicle && existingVehicle.driverId !== req.userId) {
				return res.status(400).json({
					message:
						"Vehicle with this plate already exists and belongs to someone else.",
				});
			}

			if (existingVehicle) {
				rideVehicleId = existingVehicle.id;
			} else {
				const newVehicle = await prisma.vehicle.create({
					data: { driverId: req.userId, model, color, plate },
				});
				rideVehicleId = newVehicle.id;
			}
		} else {
			const userOwnsVehicle = user.vehicles.some((v) => v.id === vehicleId);
			if (!userOwnsVehicle)
				return res
					.status(403)
					.json({ message: "Vehicle does not belong to user." });
		}

		const ride = await prisma.ride.create({
			data: {
				driverId: req.userId,
				startLocation,
				startLat,
				startLng,
				destination,
				destLat: desLat,
				destLng: desLng,
				dateTime: new Date(dateTime),
				seats: parseInt(seats),
				price: parseFloat(price),
				vehicleId: rideVehicleId,
				preferences: {
					create: {
						verifiedRiders: preferences?.verifiedRiders || false,
						sameGender: preferences?.sameGender || false,
						nonSmoking: preferences?.nonSmoking || false,
						ecoFriendly: preferences?.ecoFriendly || false,
						allowPets: preferences?.allowPets || false,
						quietRide: preferences?.quietRide || false,
					},
				},
			},
			include: {
				preferences: true,
				vehicle: true,
			},
		});

		res.status(201).json({ message: "Ride offered successfully.", ride });
	} catch (error) {
		console.error("Error offering ride:", error);
		res
			.status(500)
			.json({ message: "Internal server error.", error: error.message });
	}
};

export const getMyRides = async (req, res) => {
	try {
		const rides = await prisma.ride.findMany({
			where: { driverId: req.userId },
			include: { vehicle: true, preferences: true },
			orderBy: { dateTime: "desc" },
		});
		res.json({ rides });
	} catch (error) {
		console.error("Error fetching rides:", error);
		res
			.status(500)
			.json({ message: "Failed to fetch rides", error: error.message });
	}
};

export const getMyVehicles = async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.userId },
			include: { vehicles: true },
		});

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		res.status(200).json({ vehicles: user.vehicles });
	} catch (error) {
		console.error("Error fetching vehicles:", error);
		res
			.status(500)
			.json({ message: "Internal server error.", error: error.message });
	}
};

function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371; // Radius of the earth in km
	const dLat = deg2rad(lat2 - lat1);
	const dLon = deg2rad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c; // Distance in km
	return distance;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}


export const findRides = async (req, res) => {
	try {
		const {
			startLat,
			startLng,
			desLat,
			desLng,
			radius = 5,
			dateTime,
			preferences = {},
		} = req.query;

		if (!startLat || !startLng || !desLat || !desLng) {
			return res.status(400).json({
				success: false,
				message: "Start and destination coordinates are required",
			});
		}

		const startLatFloat = parseFloat(startLat);
		const startLngFloat = parseFloat(startLng);
		const desLatFloat = parseFloat(desLat);
		const desLngFloat = parseFloat(desLng);
		const radiusFloat = parseFloat(radius);

		// Get the user's ID from the request
		const userId = req.userId;

		let rides = await prisma.ride.findMany({
			where: {
				// Filter out rides offered by the current user
				driverId: {
					not: userId,
				},
				...(dateTime && {
					dateTime: {
						gte: new Date(dateTime),
					},
				}),
				seats: {
					gt: 0,
				},
			},
			include: {
				driver: {
					select: {
						id: true,
						fullName: true,
						email: true,
						rating: true,
						verificationStatus: true,
					},
				},
				preferences: true,
				vehicle: true,
				bookings: true, // Include all bookings to check both CONFIRMED and PENDING
			},
		});

		rides = rides.filter((ride) => {
			const startPointDistance = calculateDistance(
				startLatFloat,
				startLngFloat,
				ride.startLat,
				ride.startLng
			);

			const destPointDistance = calculateDistance(
				desLatFloat,
				desLngFloat,
				ride.destLat,
				ride.destLng
			);

			return (
				startPointDistance <= radiusFloat && destPointDistance <= radiusFloat
			);
		});


		if (preferences) {
			const preferencesObj = {};

			Object.keys(req.query).forEach((key) => {
				if (key.startsWith("preferences[")) {
					const prefKey = key.replace("preferences[", "").replace("]", "");
					preferencesObj[prefKey] = req.query[key] === "true";
				}
			});

			rides = rides.filter((ride) => {
				// Skip rides that don't match required preferences
				for (const [key, value] of Object.entries(preferencesObj)) {
					if (value && (!ride.preferences || !ride.preferences[key])) {
						return false;
					}
				}
				return true;
			});
		}

		rides = rides.map((ride) => {
			
			const confirmedSeats = ride.bookings
				.filter((booking) => booking.status === "CONFIRMED")
				.reduce((total, booking) => total + booking.seats, 0);

			// Count PENDING seats
			const pendingSeats = ride.bookings
				.filter((booking) => booking.status === "PENDING")
				.reduce((total, booking) => total + booking.seats, 0);

			// Calculate actual available seats (total - confirmed - pending)
			const availableSeats = ride.seats - confirmedSeats - pendingSeats;

			// Check if the current user has a booking for this ride
			const userBooking = ride.bookings.find(
				(booking) =>
					booking.userId === userId &&
					(booking.status === "CONFIRMED" || booking.status === "PENDING")
			);

			return {
				id: ride.id,
				driverId: ride.driverId,
				driver: {
					fullName: ride.driver.fullName,
					rating: ride.driver.rating,
					verificationStatus: ride.driver.verificationStatus,
				},
				startLocation: ride.startLocation,
				destination: ride.destination,
				dateTime: ride.dateTime,
				seats: availableSeats, // Use the calculated available seats
				price: ride.price,
				preferences: ride.preferences,
				model: ride.vehicle?.model || "N/A",
				color: ride.vehicle?.color || "N/A",
				booked: userBooking ? true : false,
			};
		});


		rides = rides.filter((ride) => ride.seats > 0);

		return res.status(200).json({
			success: true,
			rides,
		});
	} catch (error) {
		console.error("Error finding rides:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to find rides",
			error: error.message,
		});
	}
};


export const bookRide = async (req, res) => {
	try {
		const { rideId } = req.params;
		const userId = req.userId;
		const { seats = 1 } = req.body;

		// Check if ride exists
		const ride = await prisma.ride.findUnique({
			where: { id: rideId },
			include: {
				bookings: true, // Include all bookings
			},
		});

		if (!ride) {
			return res.status(404).json({
				success: false,
				message: "Ride not found",
			});
		}

		if (ride.driverId === userId) {
			return res.status(400).json({
				success: false,
				message: "You cannot book your own ride",
			});
		}

		// Check if the user already has an active booking for this ride
		const existingBooking = await prisma.rideBooking.findFirst({
			where: {
				rideId,
				userId,
				status: {
					in: ["CONFIRMED", "PENDING"],
				},
			},
		});

		if (existingBooking) {
			return res.status(400).json({
				success: false,
				message: "You already have an active booking request for this ride",
			});
		}

		// Calculate confirmed seats
		const confirmedSeats = ride.bookings
			.filter((booking) => booking.status === "CONFIRMED")
			.reduce((total, booking) => total + booking.seats, 0);

		// Calculate pending seats
		const pendingSeats = ride.bookings
			.filter((booking) => booking.status === "PENDING")
			.reduce((total, booking) => total + booking.seats, 0);

		// Calculate actual available seats
		const availableSeats = ride.seats - confirmedSeats - pendingSeats;

		// Check if there are enough seats available
		if (availableSeats < seats) {
			return res.status(400).json({
				success: false,
				message: `Only ${availableSeats} seats available for booking`,
			});
		}

		// Create a booking with PENDING status
		const booking = await prisma.rideBooking.create({
			data: {
				rideId,
				userId,
				seats,
				status: "PENDING",
			},
		});

		return res.status(201).json({
			success: true,
			message: "Ride booking request sent successfully",
			booking,
		});
	} catch (error) {
		console.error("Error booking ride:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to book ride",
			error: error.message,
		});
	}
};

export const approveBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const driverId = req.userId;

		// Find the booking with ride information
		const booking = await prisma.rideBooking.findUnique({
			where: {
				id: bookingId,
			},
			include: {
				ride: {
					include: {
						bookings: {
							where: {
								status: "CONFIRMED",
							},
						},
					},
				},
			},
		});

		if (!booking) {
			return res.status(404).json({
				success: false,
				message: "Booking not found",
			});
		}

		// Check if the ride belongs to the requesting driver
		if (booking.ride.driverId !== driverId) {
			return res.status(403).json({
				success: false,
				message: "You are not authorized to approve this booking",
			});
		}

		// Check if the booking is in PENDING status
		if (booking.status !== "PENDING") {
			return res.status(400).json({
				success: false,
				message: "Only pending bookings can be approved",
			});
		}

		// Calculate total confirmed seats
		const confirmedSeats = booking.ride.bookings.reduce(
			(total, b) => total + b.seats,
			0
		);

		// Check if there are enough seats available
		if (confirmedSeats + booking.seats > booking.ride.seats) {
			return res.status(400).json({
				success: false,
				message: "Not enough seats available to approve this booking",
			});
		}

		// Update booking status to CONFIRMED
		const updatedBooking = await prisma.rideBooking.update({
			where: {
				id: bookingId,
			},
			data: {
				status: "CONFIRMED",
			},
		});

		return res.status(200).json({
			success: true,
			message: "Booking approved successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		console.error("Error approving booking:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to approve booking",
			error: error.message,
		});
	}
};

export const rejectBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const driverId = req.userId;

		// Find the booking with ride information
		const booking = await prisma.rideBooking.findUnique({
			where: {
				id: bookingId,
			},
			include: {
				ride: true,
			},
		});

		if (!booking) {
			return res.status(404).json({
				success: false,
				message: "Booking not found",
			});
		}

		// Check if the ride belongs to the requesting driver
		if (booking.ride.driverId !== driverId) {
			return res.status(403).json({
				success: false,
				message: "You are not authorized to reject this booking",
			});
		}

		// Check if the booking is in PENDING status
		if (booking.status !== "PENDING") {
			return res.status(400).json({
				success: false,
				message: "Only pending bookings can be rejected",
			});
		}

		// Update booking status to REJECTED
		const updatedBooking = await prisma.rideBooking.update({
			where: {
				id: bookingId,
			},
			data: {
				status: "REJECTED",
			},
		});

		return res.status(200).json({
			success: true,
			message: "Booking rejected successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		console.error("Error rejecting booking:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to reject booking",
			error: error.message,
		});
	}
};
export const getPendingBookings = async (req, res) => {
	try {
		const driverId = req.userId;

		// Find all pending bookings for rides offered by this driver
		const pendingBookings = await prisma.rideBooking.findMany({
			where: {
				status: "PENDING",
				ride: {
					driverId: driverId,
				},
			},
			include: {
				user: {
					select: {
						id: true,
						fullName: true,
						email: true,
						phoneNumber: true,
						rating: true,
						verificationStatus: true,
					},
				},
				ride: {
					include: {
						vehicle: true,
						bookings: {
							where: {
								status: "CONFIRMED",
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Add additional information like remaining seats to each booking
		const enhancedBookings = pendingBookings.map((booking) => {
			const confirmedSeats = booking.ride.bookings.reduce(
				(total, b) => total + b.seats,
				0
			);
			const availableSeats = booking.ride.seats - confirmedSeats;

			return {
				...booking,
				ride: {
					...booking.ride,
					availableSeats,
				},
			};
		});

		return res.status(200).json({
			success: true,
			pendingBookings: enhancedBookings,
		});
	} catch (error) {
		console.error("Error fetching pending bookings:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch pending bookings",
			error: error.message,
		});
	}
};


// Get user's booked rides
export const getUserBookings = async (req, res) => {
	try {
		const userId = req.userId;

		const bookings = await prisma.rideBooking.findMany({
			where: {
				userId,
			},
			include: {
				ride: {
					include: {
						driver: {
							select: {
								id: true,
								fullName: true,
								email: true,
								phoneNumber: true,
								rating: true,
							},
						},
						vehicle: true,
						preferences: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return res.status(200).json({
			success: true,
			bookings,
		});
	} catch (error) {
		console.error("Error fetching user bookings:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch bookings",
			error: error.message,
		});
	}
};


export const cancelBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const userId = req.userId;

		// Check if booking exists and belongs to the user
		const booking = await prisma.rideBooking.findFirst({
			where: {
				id: bookingId,
				userId,
			},
		});

		if (!booking) {
			return res.status(404).json({
				success: false,
				message: "Booking not found or not authorized",
			});
		}

		// Update booking status to CANCELLED
		const updatedBooking = await prisma.rideBooking.update({
			where: {
				id: bookingId,
			},
			data: {
				status: "CANCELLED",
			},
		});

		return res.status(200).json({
			success: true,
			message: "Booking cancelled successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		console.error("Error cancelling booking:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to cancel booking",
			error: error.message,
		});
	}
};
