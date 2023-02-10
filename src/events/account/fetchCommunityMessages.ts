// ******************** //
// The fetchCommunityMessages account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account, CommunityMessage } from '@prisma/client';
import {
    FetchCommunityMessagesResult,
    FetchCommunityMessagesServerParams,
} from 'interfaces/account/fetchCommunityMessages';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchCommunityMessages({
    socket,
    from,
    to,
}: FetchCommunityMessagesServerParams): Promise<
    FetchCommunityMessagesResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (!account.isInCommunity) {
        return generateError('NOT_IN_COMMUNITY');
    }

    const fromNumber = Number(from);
    const toNumber = Number(to);

    if (fromNumber > toNumber) {
        return generateError(
            'NOT_HIGHER_NUMBER',
            { to: toNumber, from: fromNumber },
            ['to', 'from']
        );
    }

    if (toNumber - fromNumber > 100) {
        return generateError(
            'TOO_MUCH_LOAD',
            { to: toNumber, from: fromNumber },
            [100, 'messages']
        );
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

    const messages = await prismaClient.communityMessage.findMany({
        where: {
            communityId: account.communityId,
        },

        // Last shown first
        // Cursor-based pagination is much more efficient but that would require dictionaries for each socket
        // Will consider in the future
        // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
        skip: Number(from),

        // from: 5, to: 10 = 10 - 5 = 5 posts fetched after from pos
        take: -(Number(to) - Number(from)),
        select: {
            ownerId: true,
            communityId: true,
            content: true,
            creationDate: true,
            isReply: true,
            messageId: true,
            replyId: true,
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
                    followers: true,
                    following: true,
                    isPrivate: true,
                    profileId: true,
                    username: true,
                    isAdmin: true,
                    isDisabled: true,
                    isInCommunity: true,
                    communityId: true,
                },
            });

            messageAccounts.push(message.ownerId);
            messageProfileData.push(profileData);
        }
    }

    const communityMessages: {
        message: Partial<CommunityMessage>;
        profileData: Partial<Account>;
    }[] = [];

    // Push post data with profile data
    for (const messageIndex in messages) {
        const message = messages[messageIndex];

        communityMessages.push({
            message,
            profileData: getProfileData(message.ownerId),
        });
    }

    return { communityMessages: communityMessages.reverse() };
}

const fetchCommunityMessagesTemplate: EventTemplate = {
    func: fetchCommunityMessages,
    template: ['from', 'to'],
    schema: new StringSchema({
        from: {
            minLength: 1,
            maxLength: 7,
            regex: /^[0-9]+$/,
        },

        to: {
            minLength: 1,
            maxLength: 7,
            regex: /^[0-9]+$/,
        },
    }),
};

export default fetchCommunityMessagesTemplate;
