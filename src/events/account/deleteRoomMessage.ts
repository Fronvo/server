// ******************** //
// The deleteRoomMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { roomIdSchema } from 'events/shared';
import {
    DeleteRoomMessageResult,
    DeleteRoomMessageServerParams,
} from 'interfaces/account/deleteRoomMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function deleteRoomMessage({
    io,
    socket,
    roomId,
    messageId,
}: DeleteRoomMessageServerParams): Promise<
    DeleteRoomMessageResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

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

    const targetMessage = await prismaClient.roomMessage.findFirst({
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

    let deletedMessage: { count: number };

    try {
        deletedMessage = await prismaClient.roomMessage.deleteMany({
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

    io.to(room.roomId).emit('roomMessageDeleted', { roomId, messageId });

    // Don't block
    setTimeout(async () => {
        try {
            // Update last message
            const lastMessageObj = await prismaClient.roomMessage.findMany({
                where: {
                    roomId,
                },

                select: {
                    content: true,
                    creationDate: true,
                    ownerId: true,
                },

                take: -1,
            });

            const lastMessageOwner = await prismaClient.account.findFirst({
                where: {
                    profileId: lastMessageObj[0].ownerId,
                },

                select: {
                    username: true,
                },
            });

            await prismaClient.room.update({
                where: {
                    roomId,
                },
                data: {
                    lastMessage: lastMessageObj[0].content,

                    lastMessageAt: lastMessageObj[0].creationDate,

                    lastMessageFrom: lastMessageOwner.username,
                },
            });
        } catch (e) {}
    }, 1000);

    return {};
}

const deleteRoomMessageTemplate: EventTemplate = {
    func: deleteRoomMessage,
    template: ['roomId', 'messageId'],
    schema: new StringSchema({
        ...roomIdSchema,

        messageId: {
            type: 'uuid',
        },
    }),
};

export default deleteRoomMessageTemplate;
