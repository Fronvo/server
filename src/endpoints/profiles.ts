import { Request, Response } from "express";
import { getParams, informProfile, sendError, sendSuccess } from "../utils";
import { prismaClient } from "../vars";
import { accounts } from "@prisma/client";
import { LastStatus } from "types";
import { differenceInHours } from "date-fns";
import { object } from "zod";
import { attachments, note, status, tags, text } from "../schemas";

interface FetchedAccount extends accounts {
  status: LastStatus;
  note: string;
}

const updateStatusSchema = object({ status });

const updateNoteSchema = object({ note });

const createPostSchema = object({ text, attachments, tags });

export async function fetchMe(req: Request, res: Response) {
  const {
    profile_id,
    username,
    bio,
    avatar,
    banner,
    created_at,
    last_note,
    last_note_d,
    last_status,
  } = await prismaClient.accounts.findFirst({
    where: {
      profile_id: req.userId,
    },

    select: {
      profile_id: true,
      username: true,
      bio: true,
      avatar: true,
      banner: true,
      created_at: true,
      last_note: true,
      last_note_d: true,
      last_status: true,
    },
  });

  const profileData: Partial<FetchedAccount> = {
    profile_id,
    username,
    bio,
    avatar,
    banner,
    created_at,
    status: last_status as LastStatus,
  };

  // Note expires after 24 hours
  if (
    last_note &&
    last_note_d &&
    differenceInHours(new Date(), new Date(last_note_d)) < 24
  ) {
    profileData.note = last_note;
  }

  return sendSuccess(
    res,
    {
      profileData,
    },
    true
  );
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = getParams(req, ["status"]);

  const schemaResult = updateStatusSchema.safeParse({ status });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  await prismaClient.accounts.update({
    where: {
      profile_id: req.userId,
    },

    data: {
      last_status: status,
    },
  });

  informProfile(req.userId, "statusUpdated", { status });

  return sendSuccess(res, { status }, true);
}

export async function updateNote(req: Request, res: Response) {
  const { note } = getParams(req, ["note"]);

  const schemaResult = updateNoteSchema.safeParse({ note });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  await prismaClient.accounts.update({
    where: {
      profile_id: req.userId,
    },

    data: {
      last_note: note,
      last_note_d: new Date(),
    },
  });

  informProfile(req.userId, "noteUpdated", { note });

  return sendSuccess(res, { note }, true);
}

export async function createPost(req: Request, res: Response) {
  const { text, attachments, tags } = getParams(req, [
    "text",
    "attachments",
    "tags",
  ]);

  const schemaResult = createPostSchema.safeParse({ text, attachments, tags });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  // Must contain either of the 2, tags optional
  if (!text && !attachments) {
    return sendError(400, res, "Text or attachment required.");
  }

  const post = await prismaClient.posts.create({
    data: {
      // Defaults
      text,
      attachments: attachments || [],
      tags: tags || [],
      post_creator: req.userId,
    },

    select: {
      id: true,
      text: true,
      attachments: true,
      tags: true,
      created_at: true,
      post_creator: true,
    },
  });

  informProfile(req.userId, "postCreated", { post });

  return sendSuccess(res, { post }, true);
}
