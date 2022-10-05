// ******************** //
// The updateChatRequest account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    UpdateChatRequestResult,
    UpdateChatRequestServerParams,
} from 'interfaces/account/updateChatRequest';
import { EventTemplate } from 'interfaces/all';
import {
    generateError,
    getLoggedInSockets,
    getSocketAccountId,
    isAccountLoggedIn,
} from 'utilities/global';
import { prismaClient } from 'variables/global';

async function updateChatRequest({
    io,
    socket,
    profileId,
    accepted,
}: UpdateChatRequestServerParams): Promise<UpdateChatRequestResult> {
    if (typeof accepted == 'undefined') {
        return generateError('REQUIRED', { for: accepted });
    }

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

    if (!(community.ownerId == account.profileId)) {
        return generateError('NOT_COMMUNITY_OWNER');
    }

    const targetAccount = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!targetAccount) {
        return generateError('PROFILE_NOT_FOUND');
    }

    if (targetAccount.communityId != account.communityId) {
        return generateError('NOT_IN_THIS_COMMUNITY');
    }

    if (accepted) {
        if (typeof accepted != 'boolean') {
            return generateError('NOT_BOOLEAN');
        }
    }

    const newAcceptedChatRequests = community.acceptedChatRequests;
    const previousAcceptState = community.acceptedChatRequests.includes(
        targetAccount.profileId
    );

    // Can't re-update with the same state
    if (previousAcceptState == accepted) {
        return {};
    }

    if (accepted) {
        newAcceptedChatRequests.push(targetAccount.profileId);
    } else {
        newAcceptedChatRequests.splice(
            newAcceptedChatRequests.indexOf(targetAccount.profileId),
            1
        );
    }

    await prismaClient.community.update({
        where: {
            communityId: account.communityId,
        },

        data: {
            acceptedChatRequests: newAcceptedChatRequests,
        },
    });

    // Find target socket to emit to, if online
    if (!isAccountLoggedIn(targetAccount.profileId)) {
        return {};
    }

    let socketId: string;
    const sockets = getLoggedInSockets();

    for (const socketIndex in sockets) {
        if (sockets[socketIndex].accountId == targetAccount.profileId) {
            socketId = socketIndex;
            break;
        }
    }

    io.to(socketId).emit('chatRequestUpdated', { accepted });

    return {};
}

const updateChatRequestTemplate: EventTemplate = {
    func: updateChatRequest,
    template: ['profileId', 'accepted'],
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
        },

        accepted: {
            // pls
            optional: true,
        },
    }),
};

export default updateChatRequestTemplate;
