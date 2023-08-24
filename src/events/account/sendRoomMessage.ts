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
    decryptAES,
    encryptAES,
    generateError,
    getSocketAccountId,
    sendMulticastFCM,
    updateRoomSeen,
    validateSchema,
} from 'utilities/global';
import { v4 } from 'uuid';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function sendRoomMessage({
    io,
    account,
    roomId,
    message,
    replyId,
}: SendRoomMessageServerParams): Promise<SendRoomMessageResult | FronvoError> {
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

    // Check if other user is still friended
    if (room.isDM) {
        const otherUser =
            room.dmUsers[0] != account.profileId
                ? room.dmUsers[0]
                : room.dmUsers[1];

        const otherDMUser = await prismaClient.account.findFirst({
            where: {
                profileId: otherUser as string,
            },
        });

        if (!otherDMUser.friends.includes(account.profileId)) {
            return generateError('NOT_FRIEND');
        }
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

    let newMessageData: Partial<RoomMessage>;

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
        const replyMessage = await prismaClient.roomMessage.findFirst({
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
        newMessageData = await prismaClient.roomMessage.create({
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
    io.to(roomId).emit('typingEnded', {
        roomId,
        profileId: account.profileId,
    });

    io.to(roomId).emit('newRoomMessage', {
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

    // For FCM
    let finalLastMessage: string;

    try {
        setTimeout(async () => {
            // Update ordering of message lists
            await prismaClient.room.update({
                where: {
                    roomId,
                },

                data: {
                    lastMessageAt: new Date(),

                    // Reset hidden states
                    dmHiddenFor: {
                        set: [],
                    },
                },
            });

            if (isTenor) {
                finalLastMessage = `${account.username} sent a GIF`;
            } else if (isSpotify) {
                finalLastMessage = `${account.username} shared a Spotify song`;
            }

            if (!isTenor && !isSpotify) {
                if (!room.isDM) {
                    sendMulticastFCM(
                        room.members as string[],
                        decryptAES(room.name),
                        `${account.username}: ${message}`,
                        account.profileId,
                        true
                    );
                } else {
                    sendMulticastFCM(
                        room.dmUsers as string[],
                        `@${account.profileId}`,
                        `${account.username}: ${message}`,
                        account.profileId,
                        true,
                        'dm'
                    );
                }
            } else {
                if (!room.isDM) {
                    sendMulticastFCM(
                        room.members as string[],
                        decryptAES(room.name),
                        finalLastMessage,
                        account.profileId,
                        true
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
            }
        }, batchUpdatesDelay);
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Don't delay messages for these
    updateRoomSeen(io, room.roomId);

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
