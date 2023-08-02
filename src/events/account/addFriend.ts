// ******************** //
// The addFriend account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    AddFriendResult,
    AddFriendServerParams,
} from 'interfaces/account/addFriend';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getAccountFCM,
    getAccountSocketId,
    sendFCM,
} from 'utilities/global';
import { prismaClient } from 'variables/global';

async function addFriend({
    io,
    account,
    profileId,
}: AddFriendServerParams): Promise<AddFriendResult | FronvoError> {
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

    // Free limit: < 15 friends, PRO limit: < 100 friends
    if (
        account.friends.length + account.pendingFriendRequests.length >=
        (account.isPRO ? 100 : 15)
    ) {
        return generateError('OVER_FRIENDS_LIMIT');
    }

    // Target account has already sent a friend request, inform
    if (account.pendingFriendRequests.includes(profileId)) {
        return generateError('FRIEND_ALREADY_SENT');
    }

    // We have already sent a request that's pending, inform
    if (targetAccount.pendingFriendRequests.includes(account.profileId)) {
        return generateError('FRIEND_ALREADY_PENDING');
    }

    // Already our friend, inform
    if (targetAccount.friends.includes(account.profileId)) {
        return generateError('FRIEND_ALREADY_ACCEPTED');
    }

    // Send request now
    try {
        await prismaClient.account.update({
            where: {
                profileId,
            },

            data: {
                pendingFriendRequests: {
                    push: account.profileId,
                },
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Inform in real-time, only to that specific account's socket
    io.to(getAccountSocketId(profileId)).emit('newFriendRequest', {
        profileId: account.profileId,
    });

    sendFCM(
        [await getAccountFCM(targetAccount.profileId)],
        'New friend request',
        `@${account.profileId} wants to be your friend`,
        false
    );

    return {};
}

const addFriendTemplate: EventTemplate = {
    func: addFriend,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default addFriendTemplate;
