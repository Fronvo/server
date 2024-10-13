import { NextFunction, Request, Response } from "express";
import { getParams, sendError } from "../utils";
import { prismaClient } from "../vars";
import { id as idSchema } from "../schemas";
import { object } from "zod";

export default async function checkServer(
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

  req.server = server;
  req.serverId = server.id;

  next();
}
