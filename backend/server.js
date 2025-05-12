import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./src/routes/authRoutes.js";
import rideRoutes from "./src/routes/rideRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import prisma from "./src/utils/prisma.js";

dotenv.config();
const app = express();

const testDBConnection = async () => {
	try {
		await prisma.$connect();
		console.log("✅ Database connected successfully!");
	} catch (error) {
		console.error("❌ Database connection error:", error);
	}
};
testDBConnection();

const allowedOrigins = [
	"https://ride-share-two-zeta.vercel.app",
	"http://localhost:3000",
];

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	})
);

app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/users", userRoutes);

export default app;