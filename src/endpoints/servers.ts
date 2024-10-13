import { servers } from "@prisma/client";
import { Request, Response } from "express";
import {
  avatar,
  banner,
  invite,
  name,
  profileId,
  resetAvatar,
  resetBanner,
} from "../schemas";
import {
  getParams,
  sendError,
  generateChars,
  sendSuccess,
  addServerMember,
  getServerMember,
  getBannedServerMember,
  removeServerMember,
} from "../utils";
import { MAX_CONCURRENT_SERVERS, MAX_SERVERS, prismaClient } from "../vars";
import { object } from "zod";
import { deleteServer as deleteServerFunc } from "../utils";

const createServerSchema = object({ name, avatar, banner });

const joinServerSchema = object({ invite });

const transferServerSchema = object({ memberId: profileId });

const editServerSchema = object({
  name,
  avatar,
  banner,
  resetAvatar,
  resetBanner,
});

export async function createServer(req: Request, res: Response) {
  const { name, avatar, banner } = getParams(req, ["name", "avatar", "banner"]);

  const schemaResult = createServerSchema.safeParse({ name, avatar, banner });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const totalServers = await prismaClient.servers.count({
    where: { owner_id: req.userId },
  });

  if (totalServers >= MAX_SERVERS) {
    return sendError(
      400,
      res,
      `Can't create more than ${MAX_SERVERS} servers.`
    );
  }

  const serverData = await prismaClient.servers.create({
    data: {
      name,
      avatar: avatar,
      banner: banner,
      invite: generateChars(8),
      owner_id: req.userId,
    },

    select: {
      id: true,
      name: true,
      avatar: true,
      banner: true,
      invite: true,
      invites_disabled: true,
      owner_id: true,
      created_at: true,
    },
  });

  await addServerMember(serverData.id, req.userId);

  return sendSuccess(res, { serverData }, true);
}

export async function joinServer(req: Request, res: Response) {
  const { invite } = getParams(req, ["invite"]);

  const schemaResult = joinServerSchema.safeParse({ invite });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const server = await prismaClient.servers.findFirst({
    where: {
      invite,
    },
  });

  if (!server) {
    return sendError(404, res, "Server not found");
  }

  if (await getServerMember(req.serverId, req.userId)) {
    return sendError(400, res, "You already are in this server.");
  }

  if (await getBannedServerMember(req.serverId, req.userId)) {
    return sendError(400, res, "You have been banned from this server.");
  }

  if (server.invites_disabled) {
    return sendError(400, res, "This server has disabled invites.");
  }

  const totalServers = await prismaClient.member_servers.count({
    where: { profile_id: req.userId },
  });

  if (totalServers >= MAX_CONCURRENT_SERVERS) {
    return sendError(
      400,
      res,
      `Can't be in more than ${MAX_CONCURRENT_SERVERS} servers.`
    );
  }

  await addServerMember(server.id, req.userId);

  return sendSuccess(res, "Server joined.");
}

export async function editServer(req: Request, res: Response) {
  const { name, avatar, banner, resetAvatar, resetBanner } = getParams(req, [
    "name",
    "avatar",
    "banner",
    "resetAvatar",
    "resetBanner",
  ]);

  const schemaResult = editServerSchema.safeParse({
    name,
    avatar,
    banner,
    resetAvatar,
    resetBanner,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const updateDict: Partial<servers> = {
    name,
  };

  if (resetAvatar) updateDict.avatar = "";
  else if (avatar) updateDict.avatar = avatar;

  if (resetBanner) updateDict.banner = "";
  else if (banner) updateDict.banner = banner;

  await prismaClient.servers.update({
    where: {
      id: req.serverId,
    },

    data: updateDict,
  });

  return sendSuccess(res, { serverData: updateDict }, true);
}

export async function deleteServer(req: Request, res: Response) {
  await deleteServerFunc(req.serverId);

  return sendSuccess(res, "Server deleted.");
}

export async function leaveServer(req: Request, res: Response) {
  await removeServerMember(req.serverId, req.userId);

  return sendSuccess(res, "Left server.");
}

export async function transferServer(req: Request, res: Response) {
  const { memberId } = getParams(req, ["memberId"]);

  const schemaResult = transferServerSchema.safeParse({ memberId });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const memberData = await prismaClient.accounts.findFirst({
    where: {
      id: memberId,
    },
  });

  if (!memberData) {
    return sendError(404, res, "Member not found");
  } else if (!(await getServerMember(req.serverId, memberData.id))) {
    return sendError(404, res, "Member not found");
  }

  if (req.userId === memberId) {
    return sendError(400, res, "Can't transfer the server to yourself.");
  }

  const totalServers = await prismaClient.servers.count({
    where: { owner_id: memberId },
  });

  if (totalServers >= MAX_SERVERS) {
    return sendError(
      400,
      res,
      `Target member already owns ${MAX_SERVERS} servers.`
    );
  }

  await prismaClient.servers.update({
    where: {
      id: req.serverId,
    },

    data: {
      owner_id: memberId,
    },
  });

  return sendSuccess(res, "Server ownership transferred.", true);
}
