// ******************** //
// The deleteChannelMessage account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { channelIdSchema, serverIdSchema } from 'events/shared';
import {
    DeleteChannelMessageResult,
    DeleteChannelMessageServerParams,
} from 'interfaces/account/deleteChannelMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { deleteImage, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function deleteChannelMessage({
    io,
    account,
    serverId,
    channelId,
    messageId,
}: DeleteChannelMessageServerParams): Promise<
    DeleteChannelMessageResult | FronvoError
> {
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

    const channel = await prismaClient.channel.findFirst({
        where: {
            channelId,
        },
    });

    if (!channel) {
        return generateError('ROOM_404');
    }

    const targetMessage = await prismaClient.channelMessage.findFirst({
        where: {
            messageId,
        },
    });

    // Must be the message author / room owner
    if (
        account.profileId != targetMessage.ownerId &&
        account.profileId != server.ownerId
    ) {
        return generateError('NOT_OWNER');
    }

    let deletedMessage: { count: number };

    try {
        deletedMessage = await prismaClient.channelMessage.deleteMany({
            where: {
                messageId,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    if (deletedMessage.count == 0) {
        return generateError('INVALID', undefined, ['message ID']);
    }

    if (targetMessage.attachment) {
        deleteImage(targetMessage.attachment);
    }

    io.to(channelId).emit('messageDeleted', { roomId: channelId, messageId });

    return {};
}

const deleteChannelMessageTemplate: EventTemplate = {
    func: deleteChannelMessage,
    template: ['serverId', 'channelId', 'messageId'],
    schema: new StringSchema({
        ...serverIdSchema,
        ...channelIdSchema,

        messageId: {
            type: 'uuid',
        },
    }),
};

export default deleteChannelMessageTemplate;
