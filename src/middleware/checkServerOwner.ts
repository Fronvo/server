import { NextFunction, Request, Response } from "express";
import { getParams, getServer, getServerMember, sendError } from "../utils";
import { id as idSchema } from "../schemas";
import { object } from "zod";

export default async function checkServerAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = getParams(req, ["id"]);

  const schemaResult = object({ id: idSchema }).safeParse({ id });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const server = await getServer(id);

  if (!server) {
    return sendError(404, res, "Server not found");
  }

  if (!(await getServerMember(server.id, req.userId))) {
    return sendError(400, res, "You aren't in this server.");
  }

  if (server.owner_id !== req.userId) {
    return sendError(400, res, "You don't own this server.");
  }

  req.server = server;
  req.serverId = server.id;

  next();
}
