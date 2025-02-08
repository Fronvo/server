import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";
import ImageKit from "imagekit";
import { Server } from "socket.io";
import fetch from "node-fetch";
import { AssociatedSocket, PendingAccount } from "types";

(async () => {
  // @ts-ignore
  globalThis.Headers = fetch.Headers;
})();

configDotenv();

export const prismaClient = new PrismaClient();
export const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

// Other
export const MAX_SERVERS = 10;
export const MAX_CONCURRENT_SERVERS = 50;
export const MAX_CHANNELS = 20;
export const MAX_ROLES = 15;
export const MAX_PINS = 30;
export const MAX_MESSAGES_LOADED = 50;

// Socket.IO
export let server: Server;

export function setServer(serverVar: Server): Server {
  server = serverVar;

  return server;
}

export let associatedSockets: AssociatedSocket[] = [];

export function addAssociatedSocket(socket: AssociatedSocket) {
  associatedSockets.push(socket);
}

export function removeAssociatedSocket(socketId: string) {
  associatedSockets = associatedSockets.filter((v) => v.socketId != socketId);
}

export let pendingAccounts: PendingAccount[] = [];

export function addPendingAccount(account: PendingAccount) {
  // Overwrite pending info
  // First remove existing entry
  if (getPendingAccount(account.email)) {
    pendingAccounts = pendingAccounts.filter((v) => v.email !== account.email);
  }

  pendingAccounts.push(account);
}

export function isPendingAccount(email: string) {
  return pendingAccounts.filter((v) => v.email === email).length > 0;
}

export function getPendingAccount(email: string) {
  return pendingAccounts.find((v) => v.email === email);
}

export function removePendingAccount(email: string) {
  pendingAccounts = pendingAccounts.filter((v) => v.email !== email);
}
