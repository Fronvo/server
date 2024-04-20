// ******************** //
// The fetchRoomMessages account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account, Message } from '@prisma/client';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { decryptAES, generateError, setSocketRoomId } from 'utilities/global';
import { batchUpdatesDelay, prismaClient } from 'variables/global';
import { fromToSchema, roomIdSchema } from '../shared';
import {
    FetchMessagesResult,
    FetchMessagesServerParams,
} from 'interfaces/account/fetchMessages';

async function fetchMessages({
    socket,
    account,
    roomId,
    from,
    to,
}: FetchMessagesServerParams): Promise<FetchMessagesResult | FronvoError> {
    const room = await prismaClient.dm.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    if (!room.dmUsers.includes(account.profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    if (room.dmHiddenFor.includes(account.profileId)) {
        return generateError('DM_HIDDEN');
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

    const messages = await prismaClient.message.findMany({
        where: {
            roomId,
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
            roomId: true,
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

    const roomMessages: {
        message: Partial<Message>;
        profileData: Partial<Account>;
    }[] = [];

    // Push post data with profile data
    for (const messageIndex in messages) {
        const message = messages[messageIndex];

        const profileData = getProfileData(message.ownerId);

        roomMessages.push({
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
    setSocketRoomId(socket.id, roomId);

    setTimeout(async () => {
        // Update seen state
        const newSeenStates = account.seenStates || {};

        const totalMessages = await prismaClient.message.count({
            where: { roomId },
        });

        if (newSeenStates[roomId] != totalMessages) {
            newSeenStates[roomId] = totalMessages;

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

    return { roomMessages };
}

const fetchMessagesTemplate: EventTemplate = {
    func: fetchMessages,
    template: ['roomId', 'from', 'to'],
    schema: new StringSchema({
        ...roomIdSchema,
        ...fromToSchema,
    }),
};

export default fetchMessagesTemplate;
