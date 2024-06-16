import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";
import ImageKit from "imagekit";
import { Resend } from "resend";
import { Server } from "socket.io";
import fetch from "node-fetch";

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
export const resend = new Resend(process.env.RESEND_API_KEY);

export const maxFolders = 25;
export const maxFolderFiles = 200;

// 25 MB
export const imagekitMaxSize = 25 * 1024 * 1024;

// 500 MB
export const maxSize = 500 * 1024 * 1024;

// Socket.IO
export let server: Server;

export function setServer(serverVar: Server): Server {
  server = serverVar;

  return server;
}

export let associatedSockets: { socketId: string; accountId: string }[] = [];

export function addAssociatedSocket(socketId: string, accountId: string) {
  associatedSockets.push({ socketId, accountId });
}

export function removeAssociatedSocket(socketId: string) {
  associatedSockets = associatedSockets.filter((v) => v.socketId != socketId);
}
