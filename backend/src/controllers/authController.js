import prisma from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
	try {
		const {
			fullName,
			email,
			phoneNumber,
			password,
			streetAddress,
			city,
			state,
			pincode,
			panNumber,
			aadharNumber,
		} = req.body;

		const missingFields = [
			"fullName",
			"email",
			"phoneNumber",
			"password",
			"streetAddress",
			"city",
			"state",
			"pincode",
			"panNumber",
			"aadharNumber",
		].filter((field) => !req.body[field]);

		if (missingFields.length > 0) {
			return res
				.status(400)
				.json({ message: `Missing fields: ${missingFields.join(", ")}` });
		}

		if (!req.files?.panProof || !req.files?.aadharProof) {
			return res
				.status(400)
				.json({ message: "PAN and Aadhar proof are required" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				fullName,
				email,
				phoneNumber,
				password: hashedPassword,
				streetAddress,
				city,
				state,
				pincode,
				panNumber,
				aadharNumber,
				panProofUrl: req.files.panProof[0].location,
				aadharProofUrl: req.files.aadharProof[0].location,
				verificationStatus: "PENDING",
			},
		});

		res.status(201).json({ message: "User registered successfully", user });
	} catch (error) {
		console.error(error);
		if (error.code === "P2002") {
			return res
				.status(400)
				.json({ message: "Email, Phone, PAN, or Aadhar already exists" });
		}
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const loginUser = async (req, res) => {
	const { email, password } = req.body;
	const user = await prisma.user.findUnique({ where: { email } });

	if (!user) return res.status(404).json({ message: "User doesn't exist" });

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

	if (user.verificationStatus === "PENDING") {
		return res
			.status(403)
			.json({ message: "Verification is still in progress." });
	}

	const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	res.json({
		message: "Login successful",
		token,
		verificationStatus: user.verificationStatus,
	});
};
