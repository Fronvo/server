// ******************** //
// The sendRoomMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { RoomMessage } from '@prisma/client';
import {
    SendRoomMessageResult,
    SendRoomMessageServerParams,
} from 'interfaces/account/sendRoomMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getSocketAccountId,
    validateSchema,
} from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function sendRoomMessage({
    io,
    socket,
    roomId,
    message,
    replyId,
}: SendRoomMessageServerParams): Promise<SendRoomMessageResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        select: {
            avatar: true,
            banner: true,
            bio: true,
            creationDate: true,
            profileId: true,
            username: true,
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

    // Must be in the room
    if (
        !room.members.includes(account.profileId) &&
        !room.dmUsers.includes(account.profileId)
    ) {
        return generateError('NOT_IN_ROOM');
    }

    // Remove unnecessary whitespace, dont allow 3 new lines in a row
    message = message.trim().replace(/\n\n\n/g, '');

    const newSchemaResult = validateSchema(
        new StringSchema({
            message: {
                minLength: 1,
                maxLength: 500,
            },
        }),
        { message }
    );

    if (newSchemaResult) {
        return newSchemaResult;
    }

    let replyContent = '';

    if (replyId) {
        const replyMessage = await prismaClient.roomMessage.findFirst({
            where: {
                messageId: replyId,
            },

            select: {
                content: true,
            },
        });

        if (!replyMessage) {
            return generateError('INVALID', undefined, ['message ID']);
        }

        replyContent = replyMessage.content;
    }

    let newMessageData: Partial<RoomMessage>;

    try {
        newMessageData = await prismaClient.roomMessage.create({
            data: {
                ownerId: account.profileId,
                roomId,
                messageId: v4(),
                content: message,
                isReply: Boolean(replyId),
                replyContent,
            },

            select: {
                ownerId: true,
                roomId: true,
                content: true,
                creationDate: true,
                messageId: true,
                isReply: true,
                replyContent: true,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    const targetSockets = await io.in(roomId).fetchSockets();

    // Force end typing
    io.to(roomId).emit('typingEnded', {
        roomId,
        profileId: account.profileId,
    });

    io.to(roomId).emit('newRoomMessage', {
        roomId,
        newMessageData: {
            message: newMessageData,
            profileData: account,
        },
    });

    try {
        // Update ordering of message lists
        await prismaClient.room.update({
            where: {
                roomId,
            },

            data: {
                lastMessage: message,
                lastMessageAt: new Date(),
                lastMessageFrom: account.username,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Don't delay messages for these
    setTimeout(async () => {
        for (const socketIndex in targetSockets) {
            const target = targetSockets[socketIndex];

            const newSeenStates = await prismaClient.account.findFirst({
                where: {
                    profileId: getSocketAccountId(target.id),
                },

                select: {
                    seenStates: true,
                },
            });

            if (!newSeenStates.seenStates) {
                // @ts-ignore
                newSeenStates.seenStates = {};
            }

            newSeenStates.seenStates[roomId] =
                await prismaClient.roomMessage.count({
                    where: { roomId },
                });

            try {
                await prismaClient.account.update({
                    where: {
                        profileId: getSocketAccountId(target.id),
                    },

                    data: {
                        seenStates: newSeenStates.seenStates,
                    },
                });
            } catch (e) {}
        }
    }, 1000);

    return {};
}

const sendRoomMessageTemplate: EventTemplate = {
    func: sendRoomMessage,
    template: ['roomId', 'message', 'replyId'],
    schema: new StringSchema({
        roomId: {
            type: 'uuid',
        },

        message: {
            minLength: 1,
            maxLength: 500,
        },

        replyId: {
            optional: true,
            type: 'uuid',
        },
    }),
};

export default sendRoomMessageTemplate;
