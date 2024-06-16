import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils";
import { prismaClient } from "../vars";

export default async function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers["authorization"];

  if (!header) {
    return sendError(401, res, "No authentication provided");
  }

  const secret = process.env.JWT_SECRET;
  const token = header.split(" ")[1];

  jwt.verify(
    token,
    secret,
    {
      algorithms: ["HS256"],
    },
    async (err, decoded) => {
      if (err) return sendError(401, res, "Invalid token");

      const id = (decoded as { id: string }).id;

      req.userId = id;
      req.userObj = await prismaClient.accounts.findUnique({
        where: {
          profile_id: id,
        },
      });

      // Deleted account most likely, reject
      if (!req.userObj) {
        return sendError(401, res, "Invalid token");
      }

      next();
    }
  );
}
