// Environmental variables
import { configDotenv } from "dotenv";

configDotenv();

import express from "express";
import { createServer } from "http";

// Endpoints
import {
  deleteAccount,
  generateAccessToken,
  login,
  register,
} from "./endpoints/auth";
import { fetchMe, updateNote, updateStatus } from "./endpoints/profiles";
import { getVersion, keepAlive } from "./endpoints/other";

// Middleware
import verifyJWT from "./middleware/verifyJWT";
import performanceChecker from "./middleware/performanceChecker";

// Helpers
import setupSocketIO from "./other/setupSocketIO";
import startupChecks from "./other/startupChecks";

// Target PORT
const PORT = process.env.PORT || 3001;

// Initialise app
startupChecks();

const app = express();
const httpServer = createServer(app);
setupSocketIO(httpServer);

// Keep alive
app.get("/keep-alive", keepAlive);

// JSON requests only
app.use(express.json());

// Version
app.get("/version", getVersion);

// Performance checks
// @ts-ignore
app.use(performanceChecker);

// Authentication
app.post("/register", register);
app.post("/login", login);

// JWT required for the routes below this middleware
app.use(verifyJWT);

// Generate access token with refresh token
app.get("/accessToken", generateAccessToken);

// Profiles
app.get("/me", fetchMe);
app.post("/me/updateStatus", updateStatus);
app.post("/me/updateNote", updateNote);

// Other
app.delete("/login", deleteAccount);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

export default app;
