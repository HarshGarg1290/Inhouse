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
const port = process.env.PORT || 4000;

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
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("CORS policy does not allow this origin"));
			}
		},
		methods: "GET,POST,PUT,DELETE,OPTIONS",
		credentials: true, 
	})
);
app.options("*", cors()); 


app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/users", userRoutes);

app.listen(port, () => {
	console.log("server started on port:" + port);
});


