import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const testDBConnection = async () => {
	try {
		await prisma.$connect();
		console.log("✅ Database connected successfully!");
	} catch (error) {
		console.error("❌ Database connection error:", error);
	}
};

testDBConnection();

app.use(cors());
app.use(bodyParser.json());


const s3 = new aws.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});


const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: process.env.AWS_BUCKET_NAME,
		metadata: (req, file, cb) => {
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			const fileName = `${Date.now()}-${file.originalname}`;
			cb(null, fileName);
		},
	}),
});

app.post(
	"/register",
	upload.fields([
		{ name: "panProof", maxCount: 1 },
		{ name: "aadharProof", maxCount: 1 },
	]),
	async (req, res) => {
		try {
			console.log("Full Request Body:", req.body);
			console.log("Full Request Files:", req.files);

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

			// Validate that all required fields are present
			const requiredFields = [
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
			];

			const missingFields = requiredFields.filter((field) => !req.body[field]);
			if (missingFields.length > 0) {
				return res.status(400).json({
					message: `Missing required fields: ${missingFields.join(", ")}`,
				});
			}

			// Validate file uploads
			if (!req.files || !req.files.panProof || !req.files.aadharProof) {
				return res
					.status(400)
					.json({ message: "PAN and Aadhar proof are required" });
			}

			// Get file URLs from S3
			const panProofUrl = req.files.panProof[0].location;
			const aadharProofUrl = req.files.aadharProof[0].location;

			// Hash password
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
					panProofUrl,
					aadharProofUrl,
					verificationStatus: "PENDING",
				},
			});

			res.status(201).json({ message: "User registered successfully", user });
		} catch (error) {
			console.error("Full Error Object:", error);

			if (error.code === "P2002") {
				return res
					.status(400)
					.json({ message: "Email, Phone, PAN, or Aadhar already exists" });
			}

			console.error("Detailed Registration Error:", {
				message: error.message,
				stack: error.stack,
				name: error.name,
				code: error.code,
			});

			res.status(500).json({
				message: "Internal server error",
				errorDetails: error.message,
			});
		}
	}
);
app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const user = await prisma.user.findUnique({ where: { email } });

	if (!user) {
		return res.status(404).json({ message: "User doesn't exist" });
	}


	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return res.status(400).json({ message: "Invalid credentials" });
	}

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
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
