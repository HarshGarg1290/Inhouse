import app from "../server.js";
import serverless from "serverless-http";

const handler = serverless(app);

export default async function (req, res) {
	return handler(req, res);
}
