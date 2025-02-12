import { boolean, number, string } from "zod";

const imageRegex = /https:\/\/ik.imagekit.io\/fronvo2\/[a-zA-Z0-9-]+/;
const imageFolderRegex =
  /https:\/\/ik.imagekit.io\/fronvo2\/[a-z]+\/[a-z_]+\/[a-zA-Z0-9-]+/;
const imageSingularFolderRegex =
  /https:\/\/ik.imagekit.io\/fronvo2\/[a-z]+\/[a-zA-Z0-9-]+/;

export const id = string().uuid();

export const username = string().min(1).max(30);

export const profileId = string().min(3).max(30);

export const email = string().email();

export const password = string().min(8);

// Register verification code
export const code = string().length(6);

// Notes
export const status = string().max(30);

// Posts
export const text = string().max(50).optional();
export const attachment = string().regex(imageFolderRegex);

// Servers
export const name = string().max(30);
export const avatar = string().regex(imageSingularFolderRegex).optional();
export const banner = string().regex(imageSingularFolderRegex).optional();
export const resetAvatar = boolean().optional();
export const resetBanner = boolean().optional();
export const invite = string().length(8);

// Channels
export const channelName = string().min(1).max(20);

// Roles
export const roleName = string().min(1).max(15);
export const roleColor = string().length(7).optional(); // RGB
export const members = profileId.array();
export const membersOptional = profileId.array().optional();

// Messages
export const messageContent = string().min(1).max(250);
export const fromSchema = number().min(0);
export const toSchema = number().min(0);
