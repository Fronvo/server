// ******************** //
// The fetchChannelMessages account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account, ChannelMessage } from '@prisma/client';
import { channelIdSchema, fromToSchema, serverIdSchema } from 'events/shared';
import {
    FetchChannelMessagesResult,
    FetchChannelMessagesServerParams,
} from 'interfaces/account/fetchChannelMessages';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { decryptAES, generateError, setSocketRoomId } from 'utilities/global';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function fetchChannelMessages({
    socket,
    account,
    serverId,
    channelId,
    from,
    to,
}: FetchChannelMessagesServerParams): Promise<
    FetchChannelMessagesResult | FronvoError
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

    const fromNumber = Number(from);
    const toNumber = Number(to);

    if (fromNumber > toNumber) {
        return generateError('NOT_HIGHER', { to: toNumber, from: fromNumber }, [
            'to',
            'from',
        ]);
    }

    if (toNumber - fromNumber > 100) {
        return generateError('TOO_MUCH', { to: toNumber, from: fromNumber }, [
            100,
            'messages',
        ]);
    }

    // Gather available account data
    const pendingAccounts = [];
    const messageAccounts = [];
    const messageProfileData: Partial<Account>[] = [];

    function getProfileData(author: string): Partial<Account> {
        for (const profileIndex in messageProfileData) {
            const targetProfile = messageProfileData[profileIndex];

            if (targetProfile.profileId == author) {
                return targetProfile;
            }
        }
    }

    const messages = await prismaClient.channelMessage.findMany({
        where: {
            channelId,
        },

        // Last shown first
        // Cursor-based pagination is much more efficient but that would require dictionaries for each socket
        // Will consider in the future
        // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
        skip: Number(from),

        // from: 5, to: 10 = 10 - 5 = 5 messages fetched after from pos
        take: -(Number(to) - Number(from)),
        select: {
            ownerId: true,
            channelId: true,
            content: true,
            creationDate: true,
            messageId: true,
            isReply: true,
            replyId: true,
            isImage: true,
            attachment: true,
            width: true,
            height: true,
            isSpotify: true,
            spotifyEmbed: true,
            isTenor: true,
            tenorUrl: true,
        },
    });

    async function getMessageAccounts(): Promise<void> {
        return new Promise((resolve) => {
            if (messages.length == 0) {
                resolve();
                return;
            }

            // Add all profile IDs to the list
            for (const messageIndex in messages) {
                const message = messages[messageIndex];

                if (
                    !messageAccounts.includes(message.ownerId) &&
                    !pendingAccounts.includes(message.ownerId)
                ) {
                    pendingAccounts.push(message.ownerId);

                    prismaClient.account
                        .findFirst({
                            where: {
                                profileId: message.ownerId,
                            },

                            select: {
                                avatar: true,
                                banner: true,
                                bio: true,
                                creationDate: true,
                                profileId: true,
                                username: true,
                                turbo: true,
                            },
                        })
                        .then((data) => {
                            messageAccounts.push(message.ownerId);

                            messageProfileData.push(data);

                            if (messageAccounts.length == messages.length) {
                                resolve();
                                return;
                            }
                        });
                } else {
                    messageAccounts.push(message.ownerId);
                }
            }
        });
    }

    await getMessageAccounts();

    const channelMessages: {
        message: Partial<ChannelMessage>;
        profileData: Partial<Account>;
    }[] = [];

    // Push post data with profile data
    for (const messageIndex in messages) {
        const message = messages[messageIndex];

        const profileData = getProfileData(message.ownerId);

        channelMessages.push({
            message: {
                ...message,
                content: message.content ? decryptAES(message.content) : '',
            },
            profileData: {
                ...profileData,
                avatar: profileData.avatar,
            },
        });
    }

    // Update seen states functionality
    setSocketRoomId(socket.id, channelId);

    setTimeout(async () => {
        // Update seen state
        const newSeenStates = account.seenStates || {};

        const totalMessages = await prismaClient.channelMessage.count({
            where: { channelId },
        });

        if (newSeenStates[channelId] != totalMessages) {
            newSeenStates[channelId] = totalMessages;

            try {
                await prismaClient.account.update({
                    where: {
                        profileId: account.profileId,
                    },

                    data: {
                        seenStates: newSeenStates,
                    },
                });
            } catch (e) {}
        }
    }, batchUpdatesDelay);

    return { channelMessages };
}

const fetchChannelMessagesTemplate: EventTemplate = {
    func: fetchChannelMessages,
    template: ['serverId', 'channelId', 'from', 'to'],
    schema: new StringSchema({
        ...serverIdSchema,
        ...channelIdSchema,
        ...fromToSchema,
    }),
};
export default fetchChannelMessagesTemplate;
