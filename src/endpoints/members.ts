import { Request, Response } from "express";
import {
  getBannedServerMember,
  getParams,
  getServerMember,
  sendError,
  sendSuccess,
} from "../utils";
import { prismaClient } from "../vars";
import { object } from "zod";
import { id } from "../schemas";

const kickMemberSchema = object({ memberId: id });

const banMemberSchema = object({ memberId: id });

const unbanMemberSchema = object({ memberId: id });

export async function kickMember(req: Request, res: Response) {
  const { memberId } = getParams(req, ["memberId"]);

  const schemaResult = kickMemberSchema.safeParse({ memberId });

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
    return sendError(400, res, "Can't kick yourself.");
  }

  await prismaClient.member_servers.deleteMany({
    where: {
      profile_id: memberData.id,
      server_id: req.serverId,
    },
  });

  return sendSuccess(res, "Member kicked.");
}

export async function banMember(req: Request, res: Response) {
  const { memberId } = getParams(req, ["memberId"]);

  const schemaResult = banMemberSchema.safeParse({ memberId });

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
    return sendError(400, res, "Can't ban yourself.");
  }

  await prismaClient.member_servers.deleteMany({
    where: {
      profile_id: memberData.id,
      server_id: req.serverId,
    },
  });

  await prismaClient.member_servers_banned.create({
    data: {
      profile_id: memberData.id,
      server_id: req.serverId,
    },
  });

  return sendSuccess(res, "Member banned.");
}

export async function unbanMember(req: Request, res: Response) {
  const { memberId } = getParams(req, ["memberId"]);

  const schemaResult = unbanMemberSchema.safeParse({ memberId });

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
  }

  if (!getBannedServerMember(req.serverId, memberData.id)) {
    return sendError(400, res, "Member is not banned.");
  }

  if (req.userId === memberId) {
    return sendError(400, res, "Can't unban yourself.");
  }

  await prismaClient.member_servers_banned.deleteMany({
    where: {
      profile_id: memberData.id,
      server_id: req.serverId,
    },
  });

  return sendSuccess(res, "Member unbanned.");
}
