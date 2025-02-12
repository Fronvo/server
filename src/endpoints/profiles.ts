import { Request, Response } from "express";
import {
  getAccount,
  getAccountPosts,
  getAccountServers,
  getParams,
  informProfile,
  sendEmail,
  sendError,
  sendSuccess,
} from "../utils";
import { imagekit, prismaClient } from "../vars";
import { differenceInHours, differenceInMonths } from "date-fns";
import { object } from "zod";
import { attachment, status, profileId, text } from "../schemas";
import { v4 } from "uuid";
import { FetchedAccount } from "types";

const fetchUserSchema = object({ id: profileId });

const updateStatusSchema = object({ status });

const sharePostSchema = object({ text, attachment });

export async function fetchMe(req: Request, res: Response) {
  const {
    id,
    username,
    bio,
    avatar,
    banner,
    created_at,
    last_status,
    last_status_d,
    last_data_req,
  } = await prismaClient.accounts.findFirst({
    where: {
      id: req.userId,
    },

    select: {
      id: true,
      username: true,
      bio: true,
      avatar: true,
      banner: true,
      created_at: true,
      last_status: true,
      last_status_d: true,
      last_data_req: true,
    },
  });

  const profileData: Partial<FetchedAccount> = {
    id,
    username,
    bio,
    avatar,
    banner,
    created_at,
    last_data_req,
    friends: [], // TODO
    pending_friend_requests: [], // TODO
    online: true,
    is_self: true,
  };

  // Note expires after 24 hours
  if (
    last_status &&
    last_status_d &&
    differenceInHours(new Date(), new Date(last_status_d)) < 24
  ) {
    profileData.status = last_status;
  }

  return sendSuccess(
    res,
    {
      profileData,
    },
    true
  );
}

export async function fetchUser(req: Request, res: Response) {
  const { id } = req.params;

  const schemaResult = fetchUserSchema.safeParse({ id });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  if (req.userId === id) {
    return sendError(400, res, "Use '/me' instead to fetch your own profile");
  }

  const account = await getAccount(id);

  // Sanity check for account
  if (!account) {
    return sendError(404, res, "Account not found");
  }

  return sendSuccess(
    res,
    {
      profileData: account,
    },
    true
  );
}

export async function fetchServers(req: Request, res: Response) {
  return sendSuccess(
    res,
    {
      servers: await getAccountServers(req.userId),
    },
    true
  );
}

export async function fetchConvos(req: Request, res: Response) {
  const convosTemp = await prismaClient.private_messages_users.findMany({
    where: {
      profile_id: {
        equals: req.userId,
      },
    },

    include: {
      private_rooms: {
        select: {
          last_message_at: true,
        },
      },
    },

    orderBy: {
      private_rooms: {
        last_message_at: "desc",
      },
    },
  });

  const convos = await Promise.all(
    convosTemp.map(async (v) => {
      return {
        id: v.room_id,
        last_message_at: v.private_rooms.last_message_at.toString(),
        other_user: await prismaClient.accounts.findFirst({
          where: {
            id: (
              await prismaClient.private_messages_users.findFirst({
                where: {
                  room_id: v.room_id,
                  profile_id: {
                    not: req.userId,
                  },
                },

                select: {
                  profile_id: true,
                },
              })
            ).profile_id,
          },
        }),
      };
    })
  );

  return sendSuccess(
    res,
    {
      convos,
    },
    true
  );
}

export async function fetchOurPosts(req: Request, res: Response) {
  return sendSuccess(res, { posts: await getAccountPosts(req.userId) }, true);
}

// TODO
export async function fetchHomePosts(req: Request, res: Response) {
  // const homePosts = await prismaClient.posts.findMany({
  //   where: {
  //     profile_id: {
  //       in: req.user.friends,
  //     },
  //   },
  // });

  return sendSuccess(res, { homePosts: [] }, true);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = getParams(req, ["status"]);

  const schemaResult = updateStatusSchema.safeParse({ status });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  await prismaClient.accounts.update({
    where: {
      id: req.userId,
    },

    data: {
      last_status: status,
      last_status_d: new Date(),
    },
  });

  informProfile(req.userId, "statusUpdated", { status });

  return sendSuccess(res, { status }, true);
}

export async function sharePost(req: Request, res: Response) {
  const { text, attachment } = getParams(req, ["text", "attachment"]);

  const schemaResult = sharePostSchema.safeParse({ text, attachment });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const post = await prismaClient.posts.create({
    data: {
      text,
      attachment,
      profile_id: req.userId,
    },

    select: {
      id: true,
      text: true,
      attachment: true,
      posted_at: true,
      profile_id: true,
    },
  });

  informProfile(req.userId, "postShared", { post });

  return sendSuccess(res, { post }, true);
}

export async function data(req: Request, res: Response) {
  const profileData = await prismaClient.accounts.findFirst({
    where: {
      id: req.userId,
    },

    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      avatar: true,
      banner: true,
      created_at: true,
      last_status: true,
      last_status_d: true,
      last_data_req: true,
      posts: true,
      servers: true,
    },
  });

  if (profileData.last_data_req) {
    if (differenceInMonths(new Date(), profileData.last_data_req) === 0) {
      return sendError(
        400,
        res,
        "You have requested your data in the past 30 days."
      );
    }
  }

  // Upload to imagekit
  const file = await imagekit.upload({
    file: btoa(JSON.stringify(profileData)),
    fileName: `${v4()}.json`,
    folder: "data",
    useUniqueFileName: false,
  });

  sendEmail(profileData.email, "Your Fronvo data", [
    `Your profile data is located at: ${file.url}`,
    "Remember not to share this link elsewhere!",
  ]);

  await prismaClient.accounts.update({
    where: {
      id: profileData.id,
    },

    data: {
      last_data_req: new Date(),
    },
  });

  return sendSuccess(res, "Data sent");
}
