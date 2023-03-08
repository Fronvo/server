// ******************** //
// The kickMember account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    KickMemberResult,
    KickMemberServerParams,
} from 'interfaces/account/kickMember';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getAccountSocketId,
    getSocketAccountId,
} from 'utilities/global';
import { loggedInSockets, prismaClient } from 'variables/global';

async function kickMember({
    io,
    socket,
    profileId,
}: KickMemberServerParams): Promise<KickMemberResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    // Must be in community
    if (!account.isInCommunity) {
        return generateError('NOT_IN_COMMUNITY');
    }

    const community = await prismaClient.community.findFirst({
        where: {
            communityId: account.communityId,
        },
    });

    // Must be the owner
    if (!(account.profileId == community.ownerId)) {
        return generateError('NOT_COMMUNITY_OWNER');
    }

    // Check if member with id is in this community
    if (!community.members.includes(profileId)) {
        return generateError('NOT_IN_THIS_COMMUNITY');
    }

    // Kick him now

    // Remove from members list
    const newMembers = community.members;
    const newAcceptedChatRequests = community.acceptedChatRequests;

    // Remove current member
    newMembers.splice(newMembers.indexOf(profileId), 1);

    // If the chat request is accepted, remove
    if (newAcceptedChatRequests.includes(profileId)) {
        newAcceptedChatRequests.splice(
            newAcceptedChatRequests.indexOf(profileId),
            1
        );
    }

    await prismaClient.community.update({
        where: {
            communityId: community.communityId,
        },

        data: {
            members: newMembers,
            acceptedChatRequests: newAcceptedChatRequests,
        },
    });

    // Update the member's profile aswell
    await prismaClient.account.update({
        where: {
            profileId,
        },

        data: {
            communityId: '',
            isInCommunity: false,
        },
    });

    // Notify all members (including banned member, update client)
    io.to(community.communityId).emit('memberLeft', {
        profileId,
    });

    // Remove socket from community room (if online)
    await loggedInSockets[getAccountSocketId(profileId)]?.socket.leave(
        community.communityId
    );

    return {};
}

const kickMemberTemplate: EventTemplate = {
    func: kickMember,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default kickMemberTemplate;
