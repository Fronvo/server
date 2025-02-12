import { Request, Response } from "express";
import { generateChars, getServer, informCustom, sendSuccess } from "../utils";
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

  informCustom(req.userId, "inviteRegenerated", "servers", {
    server: await getServer(req.serverId),
    invite,
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

  informCustom(req.userId, "inviteToggled", "servers", {
    server: await getServer(req.serverId),
    state: false,
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

  informCustom(req.userId, "inviteToggled", "servers", {
    server: await getServer(req.serverId),
    state: true,
  });

  return sendSuccess(res, "Server invites enabled.");
}
