// ******************** //
// The fetchCommunityMessages account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
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

    const communityMessages = await prismaClient.communityMessage.findMany({
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
