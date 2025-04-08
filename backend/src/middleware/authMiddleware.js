import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
	const token = req.header("Authorization");
	if (!token)
		return res
			.status(401)
			.json({ message: "Access denied. No token provided." });

	try {
		const decoded = jwt.verify(
			token.replace("Bearer ", ""),
			process.env.JWT_SECRET
		);
		req.userId = decoded.userId;
		next();
	} catch (error) {
		res.status(403).json({ message: "Invalid token." });
	}
};
