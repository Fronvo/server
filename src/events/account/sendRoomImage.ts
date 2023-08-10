// ******************** //
// The sendRoomMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { RoomMessage } from '@prisma/client';
import {
    SendRoomImageResult,
    SendRoomImageServerParams,
} from 'interfaces/account/sendRoomImage';

import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    decryptAES,
    encryptAES,
    generateError,
    getSocketAccountId,
    sendMulticastFCM,
} from 'utilities/global';
import { v4 } from 'uuid';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function sendRoomMessage({
    io,
    account,
    roomId,
    attachment,
}: SendRoomImageServerParams): Promise<SendRoomImageResult | FronvoError> {
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

    let newMessageData: Partial<RoomMessage>;

    try {
        newMessageData = await prismaClient.roomMessage.create({
            data: {
                ownerId: account.profileId,
                roomId,
                messageId: v4(),
                isImage: true,
                attachment,
            },

            select: {
                ownerId: true,
                roomId: true,
                content: true,
                creationDate: true,
                messageId: true,
                isReply: true,
                replyContent: true,
                isImage: true,
                attachment: true,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    const targetSockets = await io.in(roomId).fetchSockets();

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
                lastMessage: encryptAES(`${account.username} sent an image`),
                lastMessageAt: new Date(),
                lastMessageFrom: '',
            },
        });

        if (!room.isDM) {
            sendMulticastFCM(
                room.members as string[],
                decryptAES(room.name),
                `${account.username} sent an image`,
                account.profileId,
                true
            );
        } else {
            sendMulticastFCM(
                room.dmUsers as string[],
                `@${account.profileId}`,
                `${account.username} sent an image`,
                account.profileId,
                true
            );
        }
    } catch (e) {
        return generateError('UNKNOWN');
    }

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
    }, batchUpdatesDelay);

    return {};
}

const sendRoomImageTemplate: EventTemplate = {
    func: sendRoomMessage,
    template: ['roomId', 'attachment'],
    schema: new StringSchema({
        roomId: {
            type: 'uuid',
        },

        attachment: {
            // Ensure https
            regex: /https:\/\/ik.imagekit.io\/fronvo(2)?\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/,
        },
    }),
};

export default sendRoomImageTemplate;
