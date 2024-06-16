import { compareSync, hashSync } from "bcrypt";
import { getParams, sendError, sendSuccess } from "../utils";
import { prismaClient } from "../vars";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import { email, password, profileId, username } from "../schemas";
import { object } from "zod";

const registerSchema = object({ username, profileId, email, password });

const loginSchema = object({ email, password });

const deleteAccountSchema = object({ password });

export async function register(req: Request, res: Response) {
  const { username, profileId, email, password } = getParams(req, [
    "username",
    "profileId",
    "email",
    "password",
  ]);

  // Validate params
  const schemaResult = registerSchema.safeParse({
    username,
    profileId,
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

  const identifier = v4();

  // Create the account
  await prismaClient.accounts.create({
    data: {
      username,
      profile_id: profileId,
      email,
      password: hashSync(password, 10),
    },
  });

  const accessToken = jwt.sign({ id: profileId }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ id: profileId }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });

  const finalDict = { accessToken, refreshToken };

  // Info for tests
  if (process.env.NODE_ENV === "test") {
    finalDict["id"] = identifier;
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
      password: true,
      profile_id: true,
    },
  });

  if (!accountObj) return sendError(404, res, "Account not found");

  // Validate the password
  if (!compareSync(password, accountObj.password)) {
    return sendError(400, res, "Invalid password");
  }

  // Send JWT token
  const accessToken = jwt.sign(
    { id: accountObj.profile_id },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1h",
    }
  );

  const refreshToken = jwt.sign(
    { id: accountObj.profile_id },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "7d",
    }
  );

  const finalDict = { accessToken, refreshToken };

  // Info for tests
  if (process.env.NODE_ENV === "test") {
    finalDict["id"] = accountObj.profile_id;
  }

  return sendSuccess(res, finalDict, true);
}

export async function deleteAccount(req: Request, res: Response) {
  // Match password
  const accountObj = await prismaClient.accounts.findFirst({
    where: {
      profile_id: req.userId,
    },

    select: {
      profile_id: true,
      password: true,
    },
  });

  const password = req.body.password;

  // Validate params
  const schemaResult = deleteAccountSchema.safeParse({
    password,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  // Validate the password
  if (!compareSync(password, accountObj.password)) {
    return sendError(400, res, "Invalid password");
  }

  // Finally, delete the account
  await prismaClient.accounts.delete({
    where: {
      profile_id: accountObj.profile_id,
    },
  });

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
