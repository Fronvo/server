// ******************** //
// The acceptFriendRequest account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    RejectFriendRequestResult,
    RejectFriendRequestServerParams,
} from 'interfaces/account/rejectFriendRequest';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function rejectFriendRequest({
    io,
    socket,
    account,
    profileId,
}: RejectFriendRequestServerParams): Promise<
    RejectFriendRequestResult | FronvoError
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

    // Remove from pending requests now
    try {
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

    // Inform the socket back
    io.to(socket.id).emit('pendingFriendRemoved', {
        profileId,
    });

    return {};
}

const rejectFriendRequestTemplate: EventTemplate = {
    func: rejectFriendRequest,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default rejectFriendRequestTemplate;
