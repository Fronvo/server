import { LastStatus, OnlineStatus, SocketEvents } from "./types";
import { v4 } from "uuid";
import { associatedSockets, server } from "./vars";

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

export function convertLastStatusToStatus(
  lastStatus: LastStatus
): OnlineStatus {
  if (lastStatus === 0) return "Online";
  else if (lastStatus === 1) return "Do Not Disturb";
  else if (lastStatus === 2) return "Idle";
  else if (lastStatus === 3) return "Offline";
}

export function getAccountSocketId(accountId: string): string {
  return associatedSockets.filter((v) => v.accountId === accountId)[0]
    ?.socketId;
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
