// Environmental variables
import { configDotenv } from "dotenv";

configDotenv();

import express from "express";
import { createServer as createServerHTTP } from "http";

// Endpoints
import {
  changePassword,
  deleteAccount,
  generateAccessToken,
  login,
  register,
  registerVerify,
  resetPassword,
  resetPasswordVerify,
} from "./endpoints/auth";
import {
  fetchMe,
  data,
  sharePost,
  updateStatus,
  fetchServers,
  fetchUser,
  fetchOurPosts,
  fetchHomePosts,
  fetchConvos,
} from "./endpoints/profiles";
import {
  createServer,
  deleteServer,
  editServer,
  joinServer,
  leaveServer,
  transferServer,
} from "./endpoints/servers";
import {
  regenerateInvite,
  disableInvite,
  enableInvite,
} from "./endpoints/invites";
import {
  createChannel,
  deleteChannel,
  editChannel,
} from "./endpoints/channels";
import {
  assignRole,
  createRole,
  deleteRole,
  editRole,
} from "./endpoints/roles";
import { banMember, kickMember, unbanMember } from "./endpoints/members";
import {
  createMessage,
  deleteMessage,
  editMessage,
  fetchMessages,
  pinMessage,
  unpinMessage,
} from "./endpoints/messages";
import { getVersion, keepAlive } from "./endpoints/other";

// Middleware
import verifyJWT from "./middleware/verifyJWT";
import performanceChecker from "./middleware/performanceChecker";
import checkServer from "./middleware/checkServer";
import checkServerAdmin from "./middleware/checkServerOwner";
import checkChannelOwner from "./middleware/checkChannelOwner";
import checkRoleOwner from "./middleware/checkRoleOwner";
import checkChannel from "./middleware/checkChannel";
import checkMessage from "./middleware/checkMessage";
import checkMessageOwner from "./middleware/checkMessageOwner";

// Helpers
import setupSocketIO from "./other/setupSocketIO";
import startupChecks from "./other/startupChecks";

// Target PORT
const PORT = process.env.PORT || 3002;

// CORS
import cors from "cors";

// Initialise app
startupChecks();

const app = express();
app.use(cors());
const httpServer = createServerHTTP(app);
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
app.post("/register/verify", registerVerify);
app.post("/login", login);
app.post("/reset", resetPassword);
app.post("/reset/verify", resetPasswordVerify);

// JWT required for the routes below this middleware
app.use(verifyJWT);

// Generate access token with refresh token
app.get("/token", generateAccessToken);

// Profiles
app.post("/me/password", changePassword);
app.get("/me", fetchMe);
app.get("/me/posts", fetchOurPosts);
app.get("/me/home", fetchHomePosts);
app.get("/me/convos", fetchConvos);
app.get("/me/servers", fetchServers);
app.post("/me/status", updateStatus);
app.post("/me/post", sharePost);
app.post("/me/data", data);
app.get("/user/:id", fetchUser);

// Servers
app.post("/servers/create", createServer);
app.post("/servers/join", joinServer);
app.post("/servers/edit", checkServerAdmin, editServer);
app.delete("/servers/delete", checkServerAdmin, deleteServer);
app.delete("/servers/leave", checkServer, leaveServer);
app.post("/servers/transfer", checkServerAdmin, transferServer);

// Invites
app.post("/invites/regenerate", checkServerAdmin, regenerateInvite);
app.post("/invites/disable", checkServerAdmin, disableInvite);
app.post("/invites/enable", checkServerAdmin, enableInvite);

// Channels
app.post("/channels/create", checkServerAdmin, createChannel);
app.post("/channels/edit", checkChannelOwner, editChannel);
app.delete("/channels/delete", checkChannelOwner, deleteChannel);

// Roles
app.post("/roles/create", checkServerAdmin, createRole);
app.post("/roles/edit", checkRoleOwner, editRole);
app.post("/roles/assign", checkRoleOwner, assignRole);
app.delete("/roles/delete", checkRoleOwner, deleteRole);

// Members
app.post("/members/kick", checkServerAdmin, kickMember);
app.post("/members/ban", checkServerAdmin, banMember);
app.post("/members/unban", checkServerAdmin, unbanMember);

// Messages
app.post("/messages/create", checkChannel, createMessage);
app.post("/messages/edit", checkMessageOwner, editMessage);
app.post("/messages/fetch", checkChannel, fetchMessages);
app.post("/messages/pin", [checkMessage, checkChannelOwner], pinMessage);
app.post("/messages/unpin", [checkMessage, checkChannelOwner], unpinMessage);
app.post("/messages/delete", checkMessageOwner, deleteMessage);

// Other
app.delete("/login", deleteAccount);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

export default app;
