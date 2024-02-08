// ******************** //
// The sendRoomMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Message } from '@prisma/client';
import {
    SendMessageResult,
    SendMessageServerParams,
} from 'interfaces/account/sendMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    decryptAES,
    encryptAES,
    generateError,
    sendMulticastFCM,
    updateRoomSeen,
    validateSchema,
} from 'utilities/global';
import { v4 } from 'uuid';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function sendMessage({
    io,
    socket,
    account,
    roomId,
    message,
    replyId,
}: SendMessageServerParams): Promise<SendMessageResult | FronvoError> {
    const room = await prismaClient.dm.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    // Must be in the room
    if (!room.dmUsers.includes(account.profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    // Check if other user is still friended
    const otherUser =
        room.dmUsers[0] != account.profileId
            ? room.dmUsers[0]
            : room.dmUsers[1];

    const otherDMUser = await prismaClient.account.findFirst({
        where: {
            profileId: otherUser as string,
        },
    });

    if (otherDMUser.profileId == account.profileId) {
        return generateError('NOT_YOURSELF');
    }

    if (!otherDMUser.friends.includes(account.profileId)) {
        return generateError('NOT_FRIEND');
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

    let newMessageData: Partial<Message>;

    // Check for Spotify link (track or playlist)
    let isSpotify = false;
    let spotifyEmbed = '';

    // First check track
    let spotifySchemaResult = validateSchema(
        new StringSchema({
            message: {
                regex: /^(https:\/\/open.spotify.com\/track\/[0-9a-zA-Z?=_-]+)$/,
            },
        }),
        { message }
    );

    // Now for playlist if not track
    if (spotifySchemaResult) {
        spotifySchemaResult = validateSchema(
            new StringSchema({
                message: {
                    regex: /^(https:\/\/open.spotify.com\/playlist\/[0-9a-zA-Z?=_-]+)$/,
                },
            }),
            { message }
        );
    }

    // Track or playlist
    if (!spotifySchemaResult) {
        isSpotify = true;
        spotifyEmbed = message.replace(
            'https://open.spotify.com/',
            'https://open.spotify.com/embed/'
        );
    }

    // Can't be both Spotify and Tenor
    // Check for Tenor link
    let isTenor = false;
    let tenorUrl: string;

    if (spotifySchemaResult) {
        let tenorSchemaResult = validateSchema(
            new StringSchema({
                message: {
                    regex: /https:\/\/media.tenor.com\/[a-zA-Z0-9_-]{16}\/[a-zA-Z0-9-_]+.gif/,
                },
            }),
            { message }
        );

        // Track or playlist
        if (!tenorSchemaResult) {
            isTenor = true;
            tenorUrl = message;
        }
    }

    let replyContent = '';

    if (replyId) {
        const replyMessage = await prismaClient.message.findFirst({
            where: {
                messageId: replyId,
            },

            select: {
                content: true,
                isImage: true,
                isSpotify: true,
                isTenor: true,
            },
        });

        if (!replyMessage) {
            return generateError('INVALID', undefined, ['message ID']);
        }

        // Can't be image / Spotify
        if (
            !replyMessage.isImage &&
            !replyMessage.isSpotify &&
            !replyMessage.isTenor
        ) {
            replyContent = replyMessage.content;
        }
    }

    try {
        newMessageData = await prismaClient.message.create({
            data: {
                ownerId: account.profileId,
                roomId,
                messageId: v4(),
                content: !isTenor && !isSpotify ? encryptAES(message) : '',
                isReply: Boolean(replyId),
                replyContent,
                isSpotify,
                spotifyEmbed,
                isTenor,
                tenorUrl,
            },

            select: {
                ownerId: true,
                roomId: true,
                content: true,
                creationDate: true,
                messageId: true,
                isReply: true,
                replyContent: true,
                isSpotify: true,
                spotifyEmbed: true,
                isTenor: true,
                tenorUrl: true,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Force end typing
    io.to(roomId).except(socket.id).emit('typingEnded', {
        roomId,
        profileId: account.profileId,
    });

    io.to(roomId).emit('newMessage', {
        roomId,
        newMessageData: {
            message: {
                ...newMessageData,
                content: message,
                replyContent: decryptAES(replyContent),
            },
            profileData: account,
        },
    });

    try {
        setTimeout(async () => {
            // Update ordering of message lists
            await prismaClient.dm.update({
                where: {
                    roomId,
                },

                data: {
                    lastMessageAt: new Date(),
                },
            });

            // For FCM
            let finalLastMessage: string;

            if (isTenor) {
                finalLastMessage = `${account.username} sent a GIF`;
            } else if (isSpotify) {
                finalLastMessage = `${account.username} shared a Spotify song`;
            }

            if (!isTenor && !isSpotify) {
                sendMulticastFCM(
                    room.dmUsers as string[],
                    `@${account.profileId}`,
                    `${account.username}: ${message}`,
                    account.profileId,
                    true,
                    'dm'
                );
            } else {
                sendMulticastFCM(
                    room.dmUsers as string[],
                    `@${account.profileId}`,
                    finalLastMessage,
                    account.profileId,
                    true,
                    'dm'
                );
            }
        }, batchUpdatesDelay);
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Don't delay messages for these
    updateRoomSeen(room.roomId);

    return {};
}

const sendMessageTemplate: EventTemplate = {
    func: sendMessage,
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

export default sendMessageTemplate;
