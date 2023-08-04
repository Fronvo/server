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
import { encryptAES, generateError } from 'utilities/global';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function deleteRoomMessage({
    io,
    account,
    roomId,
    messageId,
}: DeleteRoomMessageServerParams): Promise<
    DeleteRoomMessageResult | FronvoError
> {
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
            const lastMessageObj = (
                await prismaClient.roomMessage.findMany({
                    where: {
                        roomId,
                    },

                    select: {
                        content: true,
                        creationDate: true,
                        ownerId: true,
                        isImage: true,
                        isSpotify: true,
                        isTenor: true,
                    },

                    take: -1,
                })
            )[0];

            if (!lastMessageObj) {
                await prismaClient.room.update({
                    where: {
                        roomId,
                    },

                    data: {
                        lastMessage: '',
                        lastMessageAt: undefined,
                        lastMessageFrom: '',
                    },
                });

                return;
            }

            const lastMessageOwner = await prismaClient.account.findFirst({
                where: {
                    profileId: lastMessageObj.ownerId,
                },

                select: {
                    username: true,
                },
            });

            if (lastMessageObj.isTenor) {
                await prismaClient.room.update({
                    where: {
                        roomId,
                    },

                    data: {
                        lastMessage: encryptAES(
                            `${lastMessageOwner.username} sent a GIF`
                        ),
                        lastMessageAt: lastMessageObj.creationDate,
                        lastMessageFrom: '',
                    },
                });
            } else if (lastMessageObj.isSpotify) {
                await prismaClient.room.update({
                    where: {
                        roomId,
                    },

                    data: {
                        lastMessage: encryptAES(
                            `${lastMessageOwner.username} shared a Spotify song`
                        ),
                        lastMessageAt: lastMessageObj.creationDate,
                        lastMessageFrom: '',
                    },
                });
            } else if (lastMessageObj.isImage) {
                await prismaClient.room.update({
                    where: {
                        roomId,
                    },

                    data: {
                        lastMessage: encryptAES(
                            `${lastMessageOwner.username} sent an image`
                        ),
                        lastMessageAt: lastMessageObj.creationDate,
                        lastMessageFrom: '',
                    },
                });
            } else {
                await prismaClient.room.update({
                    where: {
                        roomId,
                    },
                    data: {
                        lastMessage: lastMessageObj.content
                            ? encryptAES(lastMessageObj.content)
                            : '',
                        lastMessageAt: lastMessageObj.creationDate,
                        lastMessageFrom: lastMessageOwner.username
                            ? encryptAES(lastMessageOwner.username)
                            : '',
                    },
                });
            }
        } catch (e) {}
    }, batchUpdatesDelay);

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
