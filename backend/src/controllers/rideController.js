import prisma from "../utils/prismaClient.js";

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
				return res
					.status(400)
					.json({
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
				destination,
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
