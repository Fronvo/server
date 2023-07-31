// ******************** //
// The acceptFriendRequest account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    AcceptFriendRequestResult,
    AcceptFriendRequestServerParams,
} from 'interfaces/account/acceptFriendRequest';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getAccountSocketId,
    sendFCM,
    getAccountFCM,
} from 'utilities/global';
import { prismaClient } from 'variables/global';

async function acceptFriendRequest({
    io,
    socket,
    profileId,
    account,
}: AcceptFriendRequestServerParams): Promise<
    AcceptFriendRequestResult | FronvoError
> {
    const targetAccount = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!targetAccount) {
        return generateError('ACCOUNT_404');
    }

    // Not yourself
    if (profileId == account.profileId) {
        return generateError('NOT_YOURSELF');
    }

    // Target account has not sent a request, inform
    if (!account.pendingFriendRequests.includes(profileId)) {
        return generateError('FRIEND_NOT_PENDING');
    }

    // Already our friend, inform
    if (targetAccount.friends.includes(account.profileId)) {
        return generateError('FRIEND_ALREADY_ACCEPTED');
    }

    // Add to friends now
    try {
        // Criss cross
        await prismaClient.account.update({
            where: {
                profileId: account.profileId,
            },

            data: {
                friends: {
                    push: profileId,
                },
            },
        });

        await prismaClient.account.update({
            where: {
                profileId,
            },

            data: {
                friends: {
                    push: account.profileId,
                },
            },
        });

        // Remove from our pending requests
        const newPendingRequests = account.pendingFriendRequests;

        newPendingRequests.splice(newPendingRequests.indexOf(profileId), 1);

        await prismaClient.account.update({
            where: {
                profileId: account.profileId,
            },

            data: {
                pendingFriendRequests: {
                    set: newPendingRequests,
                },
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Inform in real-time to both sockets
    io.to(getAccountSocketId(profileId)).emit('friendAdded', {
        profileId: account.profileId,
    });

    io.to(socket.id).emit('friendAdded', {
        profileId,
    });

    // Remove the pending request aswell
    io.to(socket.id).emit('pendingFriendRemoved', {
        profileId,
    });

    // Add both sockets to corresponding profile rooms
    socket.join(targetAccount.profileId);

    // Get target account socket if it's online
    io.sockets.sockets
        .get(getAccountSocketId(profileId))
        ?.join(account.profileId);

    sendFCM(
        [await getAccountFCM(targetAccount.profileId)],
        'Friend added',
        `@${account.profileId} has accepted your friend request`,
        false
    );

    return {};
}

const acceptFriendRequestTemplate: EventTemplate = {
    func: acceptFriendRequest,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
    fetchAccount: true,
};

export default acceptFriendRequestTemplate;
