// ******************** //
// The deleteChannel account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { channelIdSchema, serverIdSchema } from 'events/shared';
import {
    DeleteChannelResult,
    DeleteChannelServerParams,
} from 'interfaces/account/deleteChannel';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { deleteImage, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function deleteChannel({
    io,
    socket,
    account,
    serverId,
    channelId,
}: DeleteChannelServerParams): Promise<DeleteChannelResult | FronvoError> {
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

    if (account.profileId != server.ownerId) {
        return generateError('NOT_OWNER');
    }

    await prismaClient.channel.delete({
        where: {
            channelId,
        },
    });

    // Remove channel
    const newChannels = server.channels;
    newChannels.splice(newChannels.indexOf(channelId), 1);

    await prismaClient.server.update({
        where: {
            serverId,
        },

        data: {
            channels: {
                set: newChannels,
            },
        },
    });

    try {
        const deletedMessages = await prismaClient.message.findMany({
            where: {
                roomId: channelId,
            },
        });

        await prismaClient.message.deleteMany({
            where: {
                roomId: channelId,
            },
        });

        for (const messageIndex in deletedMessages) {
            const message = deletedMessages[messageIndex];

            deleteImage(message.attachment);
        }

        // Then, delete the channel
        await prismaClient.channel.delete({
            where: {
                channelId: channelId,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Make all server sockets leave the channel room
    socket.in(serverId).socketsLeave(channelId);

    io.to(serverId).emit('channelDeleted', {
        serverId,
        channelId,
    });

    return {};
}

const deleteChannelTemplate: EventTemplate = {
    func: deleteChannel,
    template: ['serverId', 'channelId'],
    schema: new StringSchema({
        ...serverIdSchema,
        ...channelIdSchema,
    }),
};

export default deleteChannelTemplate;
