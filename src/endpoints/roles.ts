import { Request, Response } from "express";
import { members, roleColor, roleName } from "../schemas";
import { getParams, getServerMember, sendError, sendSuccess } from "../utils";
import { MAX_ROLES, prismaClient } from "../vars";
import { object } from "zod";

const createRoleSchema = object({ name: roleName, color: roleColor });

const editRoleSchema = object({ name: roleName, color: roleColor });

const assignRoleSchema = object({ members });

export async function createRole(req: Request, res: Response) {
  const { name } = getParams(req, ["name"]);

  const schemaResult = createRoleSchema.safeParse({ name });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const totalRoles = await prismaClient.roles.count({
    where: { server_id: req.serverId },
  });

  if (totalRoles >= MAX_ROLES) {
    return sendError(400, res, `Can't create more than ${MAX_ROLES} channels.`);
  }

  const roleData = await prismaClient.roles.create({
    data: {
      name,
      hex_color: "#000000",
      server_id: req.serverId,
    },

    select: {
      id: true,
      name: true,
      hex_color: true,
      server_id: true,
      created_at: true,
    },
  });

  return sendSuccess(res, { roleData }, true);
}

export async function editRole(req: Request, res: Response) {
  const { name, color } = getParams(req, ["name", "color"]);

  const schemaResult = editRoleSchema.safeParse({
    name,
    color,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  const roleData = await prismaClient.roles.update({
    where: {
      id: req.roleId,
    },

    data: {
      name,
      hex_color: color || req.role.hex_color,
    },

    select: {
      id: true,
      name: true,
      hex_color: true,
      server_id: true,
      created_at: true,
    },
  });

  return sendSuccess(res, { roleData }, true);
}

export async function assignRole(req: Request, res: Response) {
  const { members } = getParams(req, ["members"]);

  const schemaResult = assignRoleSchema.safeParse({
    members,
  });

  if (!schemaResult.success) {
    return sendError(400, res, schemaResult.error.errors, true);
  }

  for (const member of members) {
    if (!(await getServerMember(req.serverId, member))) {
      return sendError(404, res, "Some members are not in this server.");
    }
  }

  await prismaClient.member_roles.createMany({
    data: (members as string[]).map((v) => {
      return {
        profile_id: v,
        role_id: req.roleId,
        server_id: req.serverId,
      };
    }),
    skipDuplicates: true,
  });

  return sendSuccess(res, "Role assigned to member(s).");
}

export async function deleteRole(req: Request, res: Response) {
  await prismaClient.member_roles.deleteMany({
    where: {
      role_id: req.roleId,
    },
  });

  await prismaClient.roles.delete({
    where: {
      id: req.roleId,
    },
  });

  return sendSuccess(res, "Role deleted.");
}
