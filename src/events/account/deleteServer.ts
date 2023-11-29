// ******************** //
// The deleteServer account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Channel, Role } from '@prisma/client';
import { serverIdSchema } from 'events/shared';
import {
    DeleteServerResult,
    DeleteServerServerParams,
} from 'interfaces/account/deleteServer';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { deleteImage, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function deleteServer({
    io,
    account,
    serverId,
}: DeleteServerServerParams): Promise<DeleteServerResult | FronvoError> {
    const server = await prismaClient.server.findFirst({
        where: {
            serverId,
        },
    });

    if (!server) {
        return generateError('SERVER_404');
    }

    if (!server.members.includes(account.profileId)) {
        return generateError('NOT_IN_SERVER');
    }

    // Leave / delete the room
    if (account.profileId == server.ownerId) {
        // Loop over channel messages, icons etc prob schedule in bg, cron?
        for (const channelIndex in server.channels) {
            // @ts-ignore type mismatch as always with JsonValue
            const channel = server.channels[channelIndex] as Channel;

            try {
                const deletedMessages = await prismaClient.message.findMany({
                    where: {
                        roomId: channel.roomId,
                    },
                });

                await prismaClient.message.deleteMany({
                    where: {
                        roomId: channel.roomId,
                    },
                });

                for (const messageIndex in deletedMessages) {
                    const message = deletedMessages[messageIndex];

                    deleteImage(message.attachment);
                }

                // Then, delete the channel
                await prismaClient.channel.delete({
                    where: {
                        roomId: channel.roomId,
                    },
                });
            } catch (e) {
                return generateError('UNKNOWN');
            }

            // Clear room
            io.socketsLeave(channel.roomId);
        }

        for (const roleIndex in server.roles) {
            // @ts-ignore type mismatch as always with JsonValue
            const role = server.roles[roleIndex] as Role;

            try {
                // Then, delete the role
                await prismaClient.role.delete({
                    where: {
                        roleId: role.roleId,
                    },
                });
            } catch (e) {
                return generateError('UNKNOWN');
            }
        }

        // Clear server
        io.socketsLeave(server.serverId);
    } else {
        return generateError('NOT_OWNER');
    }

    return {};
}

const deleteServerTemplate: EventTemplate = {
    func: deleteServer,
    template: ['serverId'],
    schema: new StringSchema({
        ...serverIdSchema,
    }),
};

export default deleteServerTemplate;
