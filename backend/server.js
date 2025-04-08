import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./src/routes/authRoutes.js";
import rideRoutes from "./src/routes/rideRoutes.js";
import prisma from "./src/utils/prismaClient.js";

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

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
