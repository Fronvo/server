// ******************** //
// The sendChannelMessage account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { ChannelMessage } from '@prisma/client';
import { channelIdSchema, serverIdSchema } from 'events/shared';
import {
    SendChannelMessageResult,
    SendChannelMessageServerParams,
} from 'interfaces/account/sendChannelMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    encryptAES,
    generateError,
    sendMulticastFCM,
    validateSchema,
} from 'utilities/global';
import { v4 } from 'uuid';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function sendChannelMessage({
    io,
    account,
    serverId,
    channelId,
    message,
    replyId,
}: SendChannelMessageServerParams): Promise<
    SendChannelMessageResult | FronvoError
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

    let newMessageData: Partial<ChannelMessage>;

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

    try {
        newMessageData = await prismaClient.channelMessage.create({
            data: {
                ownerId: account.profileId,
                channelId,
                messageId: v4(),
                content: !isTenor && !isSpotify ? encryptAES(message) : '',
                isReply: Boolean(replyId),
                replyId,
                isSpotify,
                spotifyEmbed,
                isTenor,
                tenorUrl,
            },

            select: {
                ownerId: true,
                channelId: true,
                content: true,
                creationDate: true,
                messageId: true,
                isReply: true,
                replyId: true,
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
    io.to(channelId).emit('typingEnded', {
        roomId: channelId,
        profileId: account.profileId,
    });

    io.to(channelId).emit('newMessage', {
        roomId: channelId,
        newMessageData: {
            message: {
                ...newMessageData,
                content: message,
            },
            profileData: account,
        },
    });

    try {
        setTimeout(async () => {
            // For FCM
            let finalLastMessage: string;

            if (isTenor) {
                finalLastMessage = `${account.username} sent a GIF`;
            } else if (isSpotify) {
                finalLastMessage = `${account.username} shared a Spotify song`;
            }

            if (!isTenor && !isSpotify) {
                sendMulticastFCM(
                    server.members as string[],
                    `@${account.profileId}`,
                    `${account.username}: ${message}`,
                    account.profileId,
                    true,
                    'server'
                );
            } else {
                sendMulticastFCM(
                    server.members as string[],
                    `@${account.profileId}`,
                    finalLastMessage,
                    account.profileId,
                    true,
                    'server'
                );
            }
        }, batchUpdatesDelay);
    } catch (e) {
        return generateError('UNKNOWN');
    }

    return {};
}

const sendChannelMessageTemplate: EventTemplate = {
    func: sendChannelMessage,
    template: ['serverId', 'channelId', 'message', 'replyId'],
    schema: new StringSchema({
        ...serverIdSchema,
        ...channelIdSchema,

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

export default sendChannelMessageTemplate;
