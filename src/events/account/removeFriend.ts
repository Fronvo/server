// ******************** //
// The removeFriend account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    RemoveFriendResult,
    RemoveFriendServerParams,
} from 'interfaces/account/removeFriend';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getAccountSocketId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function removeFriend({
    io,
    socket,
    account,
    profileId,
}: RemoveFriendServerParams): Promise<RemoveFriendResult | FronvoError> {
    const targetAccount = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!targetAccount) {
        return generateError('ACCOUNT_404');
    }

    // Not our friend, inform
    if (!targetAccount.friends.includes(account.profileId)) {
        return generateError('NOT_FRIEND');
    }

    // Remove from friends now
    const newFriends = account.friends;
    const newFriendsTarget = targetAccount.friends;

    newFriends.splice(newFriends.indexOf(profileId), 1);
    newFriendsTarget.splice(newFriendsTarget.indexOf(account.profileId), 1);

    try {
        await prismaClient.account.update({
            where: {
                profileId: account.profileId,
            },

            data: {
                friends: {
                    set: newFriends,
                },
            },
        });

        await prismaClient.account.update({
            where: {
                profileId,
            },

            data: {
                friends: {
                    set: newFriendsTarget,
                },
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Inform in real-time, specific account sockets
    io.to(socket.id).emit('friendRemoved', {
        profileId,
    });

    io.to(getAccountSocketId(targetAccount.profileId)).emit('friendRemoved', {
        profileId: account.profileId,
    });

    // Remove both sockets from to corresponding profile rooms
    socket.leave(targetAccount.profileId);

    // Get target account socket if it's online
    io.sockets.sockets
        .get(getAccountSocketId(profileId))
        ?.leave(account.profileId);

    return {};
}

const removeFriendTemplate: EventTemplate = {
    func: removeFriend,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
    fetchAccount: true,
};

export default removeFriendTemplate;
