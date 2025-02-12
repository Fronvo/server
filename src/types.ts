import {
  accounts,
  channels,
  member_messages,
  member_messages_pinned,
  member_roles,
  roles,
} from "@prisma/client";

export type Namespaces = "profiles" | "servers" | "dms";

export type ProfileEvents = "statusUpdated" | "postShared";

export type DMsEvents = "statusUpdated" | "postShared";

export type ServerEvents =
  | "serverCreated"
  | "serverJoined"
  | "serverEdited"
  | "serverDeleted"
  | "serverLeft"
  | "inviteRegenerated"
  | "inviteToggled"
  | "channelCreated"
  | "channelEdited"
  | "channelDeleted"
  | "memberJoined"
  | "memberLeft"
  | "memberBanned"
  | "memberUnbanned";

export type SocketEvents = ProfileEvents | DMsEvents | ServerEvents;

export interface FetchedDM {
  id: string;
  last_message_at: string;
  other_user: accounts;
}

export interface FetchedAccount extends accounts {
  id: string;
  friends: string[];
  pending_friend_requests: string[];
  status: string;
  online: boolean;
  is_self: boolean;
}

export type RoleWithMembers = roles & { member_roles: member_roles[] };

export interface ChannelWithMessages extends channels {
  member_messages: member_messages[];
  member_messages_pinned: member_messages_pinned[];
}

export interface ServerAccount {
  id: string;
  username: string;
  server_username: string;
  avatar: string;
  server_avatar: string;
  banner: string;
  bio: string;
  created_at: Date;
  joined_at: Date;
  last_status: string;
  roles: member_roles[];
}

export interface AssociatedSocket {
  socketId: string;
  accountId: string;
}

export interface PendingAccount {
  username: string;
  email: string;
  password: string;
  code: string;
}

export interface PendingResetAccount {
  email: string;
  code: string;
}
