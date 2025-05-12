import prisma from "../utils/prisma.js";

export const getUserDetails = async (req, res) => {
	try {
		const userId = req.userId; // From token

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				fullName: true,
				email: true,
				phoneNumber: true,
				streetAddress: true,
				city: true,
				state: true,
				pincode: true,
				panNumber: true,
				aadharNumber: true,
				verificationStatus: true,
				createdAt: true,
				rating: true,
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json(user);
	} catch (error) {
		console.error("Error fetching user details:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get vehicles for current user
export const getUserVehicles = async (req, res) => {
	try {
		const userId = req.userId; // From token

		const vehicles = await prisma.vehicle.findMany({
			where: { driverId: userId },
			select: {
				id: true,
				model: true,
				color: true,
				plate: true,
			},
		});

		res.status(200).json(vehicles);
	} catch (error) {
		console.error("Error fetching vehicles:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Edit vehicle (ensure vehicle belongs to current user)
export const editVehicle = async (req, res) => {
	try {
		const userId = req.userId; // From token
		const { vehicleId } = req.params;
		const { model, color, plate } = req.body;

		if (!model || !color || !plate) {
			return res.status(400).json({ error: "All fields are required" });
		}

		// Make sure the vehicle belongs to this user
		const vehicle = await prisma.vehicle.findUnique({
			where: { id: vehicleId },
		});

		if (!vehicle || vehicle.driverId !== userId) {
			return res
				.status(403)
				.json({ error: "Unauthorized to update this vehicle" });
		}

		// Update the vehicle
		const updatedVehicle = await prisma.vehicle.update({
			where: { id: vehicleId },
			data: { model, color, plate },
			select: {
				id: true,
				model: true,
				color: true,
				plate: true,
			},
		});

		res.status(200).json({
			message: "Vehicle updated successfully",
			vehicle: updatedVehicle,
		});
	} catch (error) {
		if (error.code === "P2025") {
			return res.status(404).json({ error: "Vehicle not found" });
		}
		if (error.code === "P2002") {
			return res.status(400).json({ error: "Plate number already exists" });
		}
		console.error("Error updating vehicle:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
