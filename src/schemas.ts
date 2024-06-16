import { array, number, string } from "zod";

const imageRegex =
  /https:\/\/ik.imagekit.io\/fronvo?\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/;

export const username = string().min(1).max(30);

export const profileId = string().min(3).max(30);

export const email = string().email();

export const password = string().min(8);

// Status
export const status = number().min(0).max(3);

// Notes
export const note = string().max(30);

// Posts
export const text = string().max(255).optional();
export const attachments = array(string().regex(imageRegex)).max(10).optional();
export const tags = array(string().max(30)).max(20).optional();
