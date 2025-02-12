import { Request, Response } from "express";
import { channelName } from "../schemas";
import {
  getChannel,
  getParams,
  getServer,
  informCustom,
  sendError,
  sendSuccess,
} from "../utils";
import { MAX_CHANNELS, prismaClient } from "../vars";
import { object } from "zod";

const createChannelSchema = object({ name: channelName });

const editChannelSchema = object({
  name: channelName,
});

export async function createChannel(req: Request, res: Response) {
  const { name, description } = getParams(req, ["name", "description"]);

  const schemaResult = createChannelSchema.safeParse({ name, description });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const totalChannels = await prismaClient.channels.count({
    where: { server_id: req.serverId },
  });

  if (totalChannels >= MAX_CHANNELS) {
    return sendError(
      400,
      res,
      `Can't create more than ${MAX_CHANNELS} channels.`
    );
  }

  const channelData = await prismaClient.channels.create({
    data: {
      name,
      server_id: req.serverId,
    },

    select: {
      id: true,
      name: true,
      server_id: true,
      created_at: true,
    },
  });

  const channel = await getChannel(channelData.id);
  const server = await getServer(req.serverId);

  informCustom(req.userId, "channelCreated", "servers", {
    server,
    channel,
  });

  return sendSuccess(res, { channel }, true);
}

export async function editChannel(req: Request, res: Response) {
  const { name, description } = getParams(req, ["name", "description"]);

  const schemaResult = editChannelSchema.safeParse({
    name,
    description,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const channelData = await prismaClient.channels.update({
    where: {
      id: req.channelId,
    },

    data: {
      name,
    },

    select: {
      id: true,
      name: true,
      created_at: true,
    },
  });

  const channel = await getChannel(channelData.id);
  const server = await getServer(req.serverId);

  informCustom(req.userId, "channelEdited", "servers", {
    server,
    channel,
  });

  return sendSuccess(res, { channel }, true);
}

export async function deleteChannel(req: Request, res: Response) {
  await prismaClient.member_messages.deleteMany({
    where: {
      channel_id: req.channelId,
    },
  });

  // TODO: Imagekit channel folder

  await prismaClient.channels.delete({
    where: {
      id: req.channelId,
      server_id: req.serverId,
    },
  });

  const server = await getServer(req.serverId);

  informCustom(req.userId, "channelDeleted", "servers", {
    server,
    channelId: req.channelId,
  });

  return sendSuccess(res, "Channel deleted.");
}
