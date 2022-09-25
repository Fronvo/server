// ******************** //
// The joinCommunity account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Community } from '@prisma/client';
import {
    FetchCommunityDataResult,
    FetchCommunityDataServerParams,
} from 'interfaces/account/fetchCommunityData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function joinCommunity({
    socket,
    communityId,
}: FetchCommunityDataServerParams): Promise<
    FetchCommunityDataResult | FronvoError
> {
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

    await socket.join(communityId);

    return { communityData };
}

const joinCommunityTemplate: EventTemplate = {
    func: joinCommunity,
    template: ['communityId'],
    points: 3,
    schema: new StringSchema({
        communityId: {
            minLength: 5,
            maxLength: 15,
            regex: /^[a-z0-9]+$/,
        },
    }),
};

export default joinCommunityTemplate;
