// ******************** //
// The fetchRoomMessages account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account, RoomMessage } from '@prisma/client';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { fromToSchema, roomIdSchema } from '../shared';
import {
    FetchRoomMessagesResult,
    FetchRoomMessagesServerParams,
} from 'interfaces/account/fetchRoomMessages';

async function fetchRoomMessages({
    socket,
    roomId,
    from,
    to,
}: FetchRoomMessagesServerParams): Promise<
    FetchRoomMessagesResult | FronvoError
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

    // Gather available account data (not private, or followed back)
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

    const messages = await prismaClient.roomMessage.findMany({
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
            replyContent: true,
            isImage: true,
            attachment: true,
        },
    });

    // Add all profile IDs to the list
    for (const messageIndex in messages) {
        const message = messages[messageIndex];

        if (!messageAccounts.includes(message.ownerId)) {
            const profileData = await prismaClient.account.findFirst({
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
                },
            });

            messageAccounts.push(message.ownerId);

            messageProfileData.push(profileData);
        }
    }

    const roomMessages: {
        message: Partial<RoomMessage>;
        profileData: Partial<Account>;
    }[] = [];

    // Push post data with profile data
    for (const messageIndex in messages) {
        const message = messages[messageIndex];

        roomMessages.push({
            message,
            profileData: getProfileData(message.ownerId),
        });
    }

    // Update seen state
    const newSeenStates = account.seenStates || {};

    const totalMessages = await prismaClient.roomMessage.count({
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

    return { roomMessages };
}

const fetchRoomMessagesTemplate: EventTemplate = {
    func: fetchRoomMessages,
    template: ['roomId', 'from', 'to'],
    schema: new StringSchema({
        ...roomIdSchema,
        ...fromToSchema,
    }),
};

export default fetchRoomMessagesTemplate;
