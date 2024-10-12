import { NextFunction, Request, Response } from "express";
import { getParams, getServerMember, sendError } from "../utils";
import { prismaClient } from "../vars";
import { object } from "zod";
import { id as idSchema } from "schemas";

export default async function checkInServer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = getParams(req, ["id"]);

  const schemaResult = object({ id: idSchema }).safeParse({ id });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const server = await prismaClient.servers.findFirst({
    where: {
      id,
    },
  });

  if (!server) {
    return sendError(404, res, "Server not found");
  }

  if (!getServerMember(server.id, req.userId)) {
    return sendError(400, res, "You aren't in this server.");
  }

  req.server = server;
  req.serverId = server.id;

  next();
}
