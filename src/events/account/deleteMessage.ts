// ******************** //
// The deleteMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { roomIdSchema } from 'events/shared';
import {
    DeleteMessageResult,
    DeleteMessageServerParams,
} from 'interfaces/account/deleteMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { deleteImage, generateError } from 'utilities/global';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function deleteMessage({
    io,
    account,
    roomId,
    messageId,
}: DeleteMessageServerParams): Promise<DeleteMessageResult | FronvoError> {
    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    if (
        !room.members.includes(account.profileId) &&
        !room.dmUsers.includes(account.profileId)
    ) {
        return generateError('NOT_IN_ROOM');
    }

    const targetMessage = await prismaClient.message.findFirst({
        where: {
            messageId,
        },
    });

    // Must be the message author / room owner
    if (
        account.profileId != room.ownerId &&
        account.profileId != targetMessage.ownerId
    ) {
        return generateError('NOT_OWNER');
    }

    if (targetMessage.isNotification) return generateError('UNKNOWN');

    let deletedMessage: { count: number };

    try {
        deletedMessage = await prismaClient.message.deleteMany({
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

    io.to(room.roomId).emit('roomMessageDeleted', { roomId, messageId });

    setTimeout(async () => {
        await prismaClient.room.update({
            where: {
                roomId: room.roomId,
            },

            data: {
                lastMessageAt: new Date(),
            },
        });
    }, batchUpdatesDelay);

    return {};
}

const deleteMessageTemplate: EventTemplate = {
    func: deleteMessage,
    template: ['roomId', 'messageId'],
    schema: new StringSchema({
        ...roomIdSchema,

        messageId: {
            type: 'uuid',
        },
    }),
};

export default deleteMessageTemplate;
