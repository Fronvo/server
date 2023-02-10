// ******************** //
// The deleteCommunityMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    DeleteCommunityMessageResult,
    DeleteCommunityMessageServerParams,
} from 'interfaces/account/deleteCommunityMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function deleteCommunityMessage({
    io,
    socket,
    messageId,
}: DeleteCommunityMessageServerParams): Promise<
    DeleteCommunityMessageResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (!account.isInCommunity) {
        return generateError('NOT_IN_COMMUNITY');
    }

    const community = await prismaClient.community.findFirst({
        where: {
            communityId: account.communityId,
        },
    });

    const targetMessage = await prismaClient.communityMessage.findFirst({
        where: {
            messageId,
        },
    });

    // Must be the message author / community owner
    if (
        account.profileId != community.ownerId &&
        account.profileId != targetMessage.ownerId
    ) {
        return generateError('NOT_COMMUNITY_OWNER');
    }

    const deletedMessage = await prismaClient.communityMessage.deleteMany({
        where: {
            messageId,
        },
    });

    if (deletedMessage.count == 0) {
        return generateError('INVALID_MESSAGE');
    }

    io.to(community.communityId).emit('communityMessageDeleted', { messageId });

    return {};
}

const deleteCommunityMessageTemplate: EventTemplate = {
    func: deleteCommunityMessage,
    template: ['messageId'],
    schema: new StringSchema({
        messageId: {
            type: 'uuid',
        },
    }),
};

export default deleteCommunityMessageTemplate;
