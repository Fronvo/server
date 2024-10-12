import { accounts, channels, roles, servers } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: accounts;
      userId: string;
      server?: servers;
      serverId?: string;
      channel?: channels;
      channelId?: string;
      role?: roles;
      roleId?: string;
    }
  }
}
