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
import { batchUpdatesDelay, prismaClient } from 'variables/global';

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
                content: message,
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
        if (isTenor) {
            // Update ordering of message lists
            await prismaClient.room.update({
                where: {
                    roomId,
                },

                data: {
                    lastMessage: `${account.username} sent a GIF`,
                    lastMessageAt: new Date(),
                    lastMessageFrom: '',

                    // Reset hidden states
                    dmHiddenFor: {
                        set: [],
                    },
                },
            });
        } else if (isSpotify) {
            // Update ordering of message lists
            await prismaClient.room.update({
                where: {
                    roomId,
                },

                data: {
                    lastMessage: `${account.username} shared a Spotify song`,
                    lastMessageAt: new Date(),
                    lastMessageFrom: '',

                    // Reset hidden states
                    dmHiddenFor: {
                        set: [],
                    },
                },
            });
        } else {
            // Update ordering of message lists
            await prismaClient.room.update({
                where: {
                    roomId,
                },

                data: {
                    lastMessage: message,
                    lastMessageAt: new Date(),
                    lastMessageFrom: account.username,

                    // Reset hidden states
                    dmHiddenFor: {
                        set: [],
                    },
                },
            });
        }
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
    }, batchUpdatesDelay);

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
