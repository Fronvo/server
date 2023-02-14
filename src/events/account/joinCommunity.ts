// ******************** //
// The joinCommunity account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Community } from '@prisma/client';
import {
    JoinCommunityResult,
    JoinCommunityServerParams,
} from 'interfaces/account/joinCommunity';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function joinCommunity({
    io,
    socket,
    communityId,
}: JoinCommunityServerParams): Promise<JoinCommunityResult | FronvoError> {
    const accountData = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (accountData.isInCommunity) {
        return generateError('ALREADY_IN_COMMUNITY');
    }

    const community = await prismaClient.community.findFirst({
        where: {
            communityId,
        },
    });

    if (!community) {
        return generateError('COMMUNITY_NOT_FOUND');
    }

    // Check if banned
    if (community.bannedMembers.includes(accountData.profileId)) {
        return generateError('COMMUNITY_BAN');
    }

    // Finally, join the community
    await prismaClient.community.update({
        where: {
            communityId,
        },

        data: {
            members: [...community.members, accountData.profileId],
        },
    });

    await prismaClient.account.update({
        where: {
            profileId: accountData.profileId,
        },

        data: {
            isInCommunity: true,
            communityId,
        },
    });

    const communityData: Partial<Community> = {
        communityId,
        ownerId: community.ownerId,
        name: community.name,
        description: community.description,
        creationDate: community.creationDate,
        icon: community.icon,
        members: community.members,
    };

    // Add socket to community room
    await socket.join(communityId);

    io.to(communityId).emit('memberJoined', {
        profileId: accountData.profileId,
    });

    return { communityData };
}

const joinCommunityTemplate: EventTemplate = {
    func: joinCommunity,
    template: ['communityId'],
    schema: new StringSchema({
        communityId: {
            minLength: 3,
            maxLength: 15,
            regex: /^[a-z0-9]+$/,
        },
    }),
};

export default joinCommunityTemplate;
