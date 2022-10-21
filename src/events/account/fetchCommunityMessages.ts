// ******************** //
// The fetchCommunityMessages account-only event file.
// ******************** //

import {
    FetchCommunityMessagesResult,
    FetchCommunityMessagesServerParams,
} from 'interfaces/account/fetchCommunityMessages';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchCommunityMessages({
    socket,
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

    const communityMessages = await prismaClient.communityMessage.findMany({
        where: {
            communityId: account.communityId,
        },

        // Last shown first
        // Cursor-based pagination is much more efficient but that would require dictionaries for each socket
        // Will consider in the future
        // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
        take: -200,
    });

    return { communityMessages };
}

const fetchCommunityMessagesTemplate: EventTemplate = {
    func: fetchCommunityMessages,
    template: [],
};

export default fetchCommunityMessagesTemplate;
