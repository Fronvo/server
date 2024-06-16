import { Request, Response } from "express";
import { sendSuccess } from "../utils";

export function keepAlive(_: Request, res: Response) {
  return res.status(200).send("Fronvo");
}

export function getVersion(_: Request, res: Response) {
  return sendSuccess(res, { version: process.env.VERSION }, true);
}
