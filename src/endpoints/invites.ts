import { Request, Response } from "express";
import { generateChars, sendSuccess } from "../utils";
import { prismaClient } from "../vars";

export async function regenerateInvite(req: Request, res: Response) {
  const invite = generateChars(8);

  await prismaClient.servers.update({
    where: {
      id: req.serverId,
    },

    data: {
      invite,
    },
  });

  return sendSuccess(res, { invite }, true);
}

export async function disableInvite(req: Request, res: Response) {
  await prismaClient.servers.update({
    where: {
      id: req.serverId,
    },

    data: {
      invites_disabled: true,
    },
  });

  return sendSuccess(res, "Server invites disabled.");
}

export async function enableInvite(req: Request, res: Response) {
  await prismaClient.servers.update({
    where: {
      id: req.serverId,
    },

    data: {
      invites_disabled: false,
    },
  });

  return sendSuccess(res, "Server invites enabled.");
}
