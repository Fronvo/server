import {
  FetchedAccount,
  Namespaces,
  RoleWithMembers,
  SocketEvents,
} from "./types";
import { v4 } from "uuid";
import { associatedSockets, prismaClient, server } from "./vars";
import gmail from "gmail-send";
import * as crypto from "node:crypto";
import { channels, member_roles, posts, servers } from "@prisma/client";
import { differenceInHours } from "date-fns";

export function getNormalisedV4(): string {
  return v4().replace(/-/, "");
}

export function getParams(
  req: { [key: string]: any },
  params: { [key: string]: any }
): { [key: string]: any } {
  const result = {};

  const payload = req.body;

  params.forEach((param: any) => {
    result[param] = payload[param];
  });

  return result;
}

export function sendError(
  code: number,
  res: { [key: string]: any },
  msg: any,
  isSchema?: boolean
) {
  return res
    .status(code)
    .json(isSchema ? { errors: [...msg] } : { errors: [{ message: msg }] });
}

export function sendSuccess(
  res: { [key: string]: any },
  msg: any,
  isRaw?: boolean
) {
  return res.status(200).json(isRaw ? { ...msg } : { success: msg });
}

export function getAccountSocketId(accountId: string): string {
  return associatedSockets.filter((v) => v.accountId === accountId)[0]
    ?.socketId;
}

export function getAccountSocketIds(accountId: string): string[] {
  return associatedSockets
    .filter((v) => v.accountId === accountId)
    .map((v) => v.socketId);
}

export function isAccountOnline(accountId: string): boolean {
  return getConnectedAccountSockets(accountId) > 0;
}

export function getConnectedAccountSockets(accountId: string): number {
  return associatedSockets.filter((v) => v.accountId === accountId).length;
}

export function informProfile(
  userId: string,
  event: SocketEvents,
  data: {}
): void {
  if (getConnectedAccountSockets(userId) > 1) {
    server
      .of("/profiles")
      .to(userId)
      .emit(event, { ...data, userId });
  } else {
    server
      .of("/profiles")
      .to(userId)
      .except(getAccountSocketId(userId))
      .emit(event, { ...data, userId });
  }
}

// TODO: Separate to profile only like this or global events
export function informCustom(
  userId: string,
  event: SocketEvents,
  namespace: Namespaces,
  data: {}
): void {
  if (getConnectedAccountSockets(userId) > 1) {
    server
      .of(namespace)
      .to(userId)
      .emit(event, { ...data, userId });
  } else {
    server
      .of(namespace)
      .to(userId)
      .except(getAccountSocketId(userId))
      .emit(event, { ...data, userId });
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  content: string[]
): Promise<void> {
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    return;
  }

  let finalHtml = "";

  for (const contentStrIndex in content) {
    finalHtml += `<p align='start'>
    ${content[contentStrIndex]}
</p>`;
  }

  const send = gmail({
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
    to,
    subject,
    html: `
<html>
    <head>
        <style>
            .main {
                width: 100%;
                padding: 10px;
            }

            .content {
                width: 40%;
                margin: auto;
                border-radius: 10px;
                box-shadow: black;
                padding-top: 15px;
            }

            p {
                font-family: Arial;
                margin-top: 5px;
                margin-bottom: 5px;
                font-size: 1.1rem;
                padding-right: 50px;
                padding-left: 50px;
                margin-bottom: 10px;
            }

            #logo {
                margin-bottom: 20px;
                padding-bottom: 10px;
            }

            #top {
                margin-top: 0;
                margin-bottom: 5px;
            }

            #colored {
                font-size: 1.4rem;
                margin-top: 0;
                margin-bottom: 20px;
            }

            #footer {
                margin-top: 10px;
                white-space: pre-wrap;
            }

            @media screen and (max-width: 1400px) {
                .main {
                    padding: 0;
                }

                .content {
                    border-radius: 0;
                    width: 100%;
                }

                p {
                    padding-left: 25px;
                    padding-right: 25px;
                }
            }
        </style>
    </head>

    <body>
        <div class='main'>
            <div class='content'>
                <p align='center' id='top'>
                    <a href='https://fronvo.com' id='top'>
                        <img src='https://avatars.githubusercontent.com/u/91828881?s=200&v=4'>
                    </a>
                </p>

                <p>Hello there,</p>

                ${finalHtml}

                <p id='footer'>
Sincerely,
The Fronvo team
                </p>

            </div>
        </div>
    </body>
</html>
`,
  });

  await send();
}

export function generateChars(chars: number) {
  return crypto.randomBytes(20).toString("hex").substring(0, chars);
}

export function generateNumbers(
  from: number,
  to: number,
  times: number
): string {
  let generatedNumbers = "";

  for (let i = 0; i < times; i++) {
    generatedNumbers += Math.floor(Math.random() * (to - from + 1)) + from;
  }

  return generatedNumbers;
}

export async function getAccount(profileId: string): Promise<Partial<FetchedAccount>> {
  const {
    username,
    bio,
    avatar,
    banner,
    created_at,
    last_status,
    last_status_d,
  } = await prismaClient.accounts.findFirst({
    where: {
      id: profileId,
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
    },
  });

  const profileData: Partial<FetchedAccount> = {
    username,
    bio,
    avatar,
    banner,
    created_at,
    online: getConnectedAccountSockets(profileId) > 0,
    is_self: false,
  };

  // Note expires after 24 hours
  if (
    last_status &&
    last_status_d &&
    differenceInHours(new Date(), new Date(last_status_d)) < 24
  ) {
    profileData.status = last_status;
  }

  return profileData;
}

export async function getAccountPosts(profileId: string): Promise<posts[]> {
  return await prismaClient.posts.findMany({
    where: {
      profile_id: profileId,
    },
  });
}

export async function getAccountServerIDs(
  profileId: string
): Promise<string[]> {
  return (
    await prismaClient.member_servers.findMany({
      where: {
        profile_id: profileId,
      },

      select: {
        server_id: true,
      },
    })
  ).map((v) => v.server_id);
}

export async function getServer(serverId: string): Promise<servers> {
  const tempServers: servers[] = await prismaClient.servers.findMany({
    where: {
      id: serverId,
    },

    orderBy: {
      created_at: "desc",
    },

    include: {
      channels: {
        orderBy: {
          created_at: "asc",
        },
      },
      roles: {
        orderBy: {
          created_at: "asc",
        },
      },
      member_servers: {
        include: {
          accounts: {
            select: {
              avatar: true,
              banner: true,
              username: true,
              bio: true,
              created_at: true,
              member_roles: true,
            },
          },
        },
        orderBy: {
          joined_at: "desc",
        },
      },
      member_servers_banned: {
        include: {
          accounts: {
            select: {
              avatar: true,
              banner: true,
              username: true,
              bio: true,
              created_at: true,
            },
          },
        },
        orderBy: {
          banned_at: "desc",
        },
      },
    },
  });

  const servers = tempServers.map(
    // @ts-ignore
    ({ member_servers_banned, member_servers, ...v }) => {
      return {
        ...v,
        members: (
          member_servers as {
            id: string;
            server_username: string;
            server_avatar: string;
            joined_at: string;
            profile_id: string;
            server_id: string;
            accounts: {
              avatar: string;
              banner: string;
              username: string;
              bio: string;
              created_at: string;
              member_roles: member_roles[];
              online: boolean;
            };
          }[]
        ).map(({ id, server_id, profile_id, accounts, ...member }) => {
          const { member_roles, ...finalAccounts } = { ...accounts };

          return {
            ...member,
            ...finalAccounts,
            roles: accounts.member_roles.filter(
              (role) => role.server_id === server_id
            ),
            id: profile_id,
            online: isAccountOnline(profile_id),
          };
        }),
        banned_members: (
          member_servers_banned as {
            id: string;
            server_username: string;
            server_avatar: string;
            banned_at: string;
            profile_id: string;
            server_id: string;
            accounts: {
              avatar: string;
              banner: string;
              username: string;
              bio: string;
              created_at: string;
            };
          }[]
        ).map(({ id, server_id, profile_id, accounts, ...member }) => {
          return { ...member, ...accounts, id: profile_id };
        }),
      };
    }
  );

  return servers[0];
}

export async function getChannel(channelId: string): Promise<channels> {
  const channel = await prismaClient.channels.findFirst({
    where: {
      id: channelId,
    },
  });

  return channel;
}

export async function getAccountServers(profileId: string): Promise<servers[]> {
  return await Promise.all(
    (await getAccountServerIDs(profileId)).map((v) => getServer(v))
  );
}

export async function addServerMember(serverId: string, memberId: string) {
  return await prismaClient.member_servers.create({
    data: {
      profile_id: memberId,
      server_id: serverId,
    },
  });
}

export async function getServerMember(serverId: string, memberId: string) {
  return await prismaClient.member_servers.findFirst({
    where: {
      profile_id: memberId,
      server_id: serverId,
    },
  });
}

export async function getMessagePinned(
  serverId: string,
  channelId: string,
  messageId: string
) {
  return (
    (await prismaClient.member_messages_pinned.count({
      where: {
        server_id: serverId,
        channel_id: channelId,
        message_id: messageId,
      },
    })) > 0
  );
}

export async function removeServerMember(serverId: string, memberId: string) {
  await Promise.all([
    deleteMemberServerRoles(memberId),
    removeServerMemberObject(),
  ]);

  async function removeServerMemberObject() {
    return await prismaClient.member_servers.deleteMany({
      where: {
        profile_id: memberId,
        server_id: serverId,
      },
    });
  }
}

export async function getBannedServerMember(
  serverId: string,
  memberId: string
) {
  return await prismaClient.member_servers_banned.findFirst({
    where: {
      profile_id: memberId,
      server_id: serverId,
    },
  });
}

export async function updateRoleMembers(
  serverId: string,
  role: RoleWithMembers,
  members: string[]
) {
  const memberIds = (role.member_roles || []).map((v) => v.profile_id);

  const newMembers = members.filter((v) => !memberIds.includes(v));
  const removedMembers = memberIds.filter((v) => !members.includes(v));

  await prismaClient.member_roles.createMany({
    data: newMembers.map((v) => {
      return {
        profile_id: v,
        role_id: role.id,
        server_id: serverId,
      };
    }),

    skipDuplicates: true,
  });

  await prismaClient.member_roles.deleteMany({
    where: {
      profile_id: {
        in: removedMembers,
      },

      role_id: role.id,
    },
  });
}

export async function deleteUserPosts(profileId: string) {
  await prismaClient.posts.deleteMany({
    where: { profile_id: profileId },
  });
}

export async function deleteMemberServerRoles(memberId: string) {
  await prismaClient.member_roles.deleteMany({
    where: { profile_id: memberId },
  });
}

export async function deleteServerRole(serverId: string, roleId: string) {
  await prismaClient.member_roles.deleteMany({
    where: {
      server_id: serverId,
      role_id: roleId,
    },
  });

  await prismaClient.roles.delete({
    where: {
      server_id: serverId,
      id: roleId,
    },
  });
}

export async function deleteServerRoles(serverId: string) {
  await prismaClient.member_roles.deleteMany({
    where: { server_id: serverId },
  });

  await prismaClient.roles.deleteMany({
    where: { server_id: serverId },
  });
}

export async function deleteServerChannels(serverId: string) {
  await prismaClient.channels.deleteMany({
    where: { server_id: serverId },
  });
}

export async function deleteMemberServerMessages(memberId: string) {
  await prismaClient.member_messages.deleteMany({
    where: { profile_id: memberId },
  });
}

export async function deleteMemberServerPins(memberId: string) {
  await prismaClient.member_messages_pinned.deleteMany({
    where: { profile_id: memberId },
  });
}

export async function deleteServerPins(serverId: string) {
  await prismaClient.member_messages_pinned.deleteMany({
    where: { server_id: serverId },
  });
}

export async function deleteServerMessages(serverId: string) {
  await prismaClient.member_messages.deleteMany({
    where: { server_id: serverId },
  });
}

export async function deleteMemberServers(memberId: string) {
  await prismaClient.member_servers.deleteMany({
    where: { profile_id: memberId },
  });
}

export async function deleteServerMembers(serverId: string) {
  await prismaClient.member_servers.deleteMany({
    where: { server_id: serverId },
  });
}

export async function deleteMemberServerBans(memberId: string) {
  await prismaClient.member_servers_banned.deleteMany({
    where: { profile_id: memberId },
  });
}

export async function deleteServerBans(serverId: string) {
  await prismaClient.member_servers_banned.deleteMany({
    where: { server_id: serverId },
  });
}

export async function deleteServer(serverId: string) {
  await Promise.all([
    deleteServerRoles(serverId),
    deleteServerChannels(serverId),
    deleteServerPins(serverId),
    deleteServerMessages(serverId),
    deleteServerBans(serverId),
    deleteServerMembers(serverId),
  ]);

  // Once all constraints have been removed
  await deleteServerObject();

  async function deleteServerObject() {
    await prismaClient.servers.delete({
      where: {
        id: serverId,
      },
    });
  }
}

export async function deleteUser(profileId: string) {
  await Promise.all([
    deleteMemberServerRoles(profileId),
    deleteMemberServerPins(profileId),
    deleteMemberServerMessages(profileId),
    deleteMemberServerBans(profileId),
    deleteMemberServers(profileId),
    deleteUserPosts(profileId),
  ]);

  // Once all constraints have been removed
  await deleteUserObject();

  async function deleteUserObject() {
    await prismaClient.accounts.delete({
      where: {
        id: profileId,
      },
    });
  }
}
