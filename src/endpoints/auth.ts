import { compareSync, hashSync } from "bcrypt";
import {
  deleteMemberServerBans,
  deleteMemberServerMessages,
  deleteMemberServerRoles,
  deleteMemberServers,
  deleteServer,
  deleteUser,
  generateNumbers,
  getParams,
  sendEmail,
  sendError,
  sendSuccess,
} from "../utils";
import {
  addPendingAccount,
  getPendingAccount,
  imagekit,
  isPendingAccount,
  prismaClient,
  removePendingAccount,
} from "../vars";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { code, email, password, profileId, username } from "../schemas";
import { object } from "zod";

const registerSchema = object({ username, email, password });

const registerVerifySchema = object({ profileId, email, code });

const loginSchema = object({ email, password });

const deleteAccountSchema = object({ password });

const changePasswordSchema = object({ password, newPassword: password });

export async function register(req: Request, res: Response) {
  const { username, email, password } = getParams(req, [
    "username",
    "email",
    "password",
  ]);

  // Validate params
  const schemaResult = registerSchema.safeParse({
    username,
    email,
    password,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  // Should be unique email
  const uniqueRes = await prismaClient.accounts.findFirst({
    where: {
      email,
    },
  });

  if (uniqueRes) {
    return sendError(400, res, "Email in use");
  }

  // 123456 in test mode
  const code =
    process.env.NODE_ENV === "test" ? "123456" : generateNumbers(0, 9, 6);

  // Create the account
  addPendingAccount({
    email,
    password: hashSync(password, 10),
    username,
    code,
  });

  if (process.env.NODE_ENV !== "test") {
    sendEmail(email, "Fronvo email verification code", [
      `Your verification code is ${code}`,
    ]);
  }

  return sendSuccess(res, "Account register verification email sent.");
}

export async function registerVerify(req: Request, res: Response) {
  const { profileId, email, code } = getParams(req, ["profileId", "email", "code"]);

  // Validate params
  const schemaResult = registerVerifySchema.safeParse({
    profileId,
    email,
    code,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  if (!isPendingAccount(email)) {
    return sendError(400, res, "Can't verify this account");
  }

  
  // Should be unique email
  const uniqueRes = await prismaClient.accounts.findFirst({
    where: {
      id: profileId,
    },
  });

  if (uniqueRes) {
    return sendError(400, res, "Profile ID in use");
  }

  const account = getPendingAccount(email);

  // Create the account
  await prismaClient.accounts.create({
    data: {
      id: profileId,
      username: account.username,
      email: account.email,
      password: account.password, // password already hashed
    },
  });

  // Remove from pending
  removePendingAccount(account.email);

  const accessToken = jwt.sign(
    { id: profileId },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1h",
    }
  );

  const refreshToken = jwt.sign(
    { id: profileId },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "7d",
    }
  );

  const finalDict = { accessToken, refreshToken };

  // Info for tests
  if (process.env.NODE_ENV === "test") {
    finalDict["id"] = profileId;
  }

  return sendSuccess(res, finalDict, true);
}

export async function login(req: Request, res: Response) {
  const { email, password } = getParams(req, ["email", "password"]);

  // Validate params
  const schemaResult = loginSchema.safeParse({
    email,
    password,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  // Check if it's a valid account
  const accountObj = await prismaClient.accounts.findFirst({
    where: {
      email,
    },

    select: {
      id: true,
      password: true,
    },
  });

  if (!accountObj) return sendError(404, res, "Account not found");

  // Validate the password
  if (!compareSync(password, accountObj.password)) {
    return sendError(400, res, "Invalid password");
  }

  // Send JWT token
  const accessToken = jwt.sign({ id: accountObj.id }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ id: accountObj.id }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });

  const finalDict = { accessToken, refreshToken };

  // Info for tests
  if (process.env.NODE_ENV === "test") {
    finalDict["id"] = accountObj.id;
  }

  return sendSuccess(res, finalDict, true);
}

export async function changePassword(req: Request, res: Response) {
  const { password, newPassword } = getParams(req, ["password", "newPassword"]);

  // Validate params
  const schemaResult = changePasswordSchema.safeParse({
    password,
    newPassword,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  // Validate the password
  if (!compareSync(password, req.user.password)) {
    return sendError(400, res, "Invalid password");
  }

  // Finally, update the account
  await prismaClient.accounts.update({
    where: {
      id: req.userId,
    },

    data: {
      password: hashSync(newPassword, 10),
    },
  });

  return sendSuccess(res, "Password updated");
}

export async function deleteAccount(req: Request, res: Response) {
  const { password } = getParams(req, ["password"]);

  // Validate params
  const schemaResult = deleteAccountSchema.safeParse({
    password,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  // Validate the password
  if (!compareSync(password, req.user.password)) {
    return sendError(400, res, "Invalid password");
  }

  // Delete related servers & their channels
  const ownedServerIds = (
    await prismaClient.servers.findMany({
      where: {
        owner_id: req.userId,
      },

      select: {
        id: true,
      },
    })
  ).map((v) => v.id);

  await Promise.all(
    ownedServerIds.map(async (v) => {
      await deleteServer(v);
    })
  );

  // Remove from other servers
  await deleteMemberServers(req.userId);
  await deleteMemberServerMessages(req.userId);
  await deleteMemberServerRoles(req.userId);
  await deleteMemberServerBans(req.userId);

  // Delete the account
  await deleteUser(req.userId);

  if (process.env.NODE_ENV !== "test") {
    // Maybe no posts / testing
    try {
      await imagekit.deleteFolder(`posts/${req.userId}`);
    } catch (e) {}
  }

  return sendSuccess(res, "Account deleted");
}

export async function generateAccessToken(req: Request, res: Response) {
  // Send JWT token
  const accessToken = jwt.sign({ id: req.userId }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });

  return sendSuccess(res, { accessToken }, true);
}
