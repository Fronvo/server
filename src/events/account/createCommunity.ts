// ******************** //
// The createCommunity account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { communityIconSchema, communityNameSchema } from 'events/shared';
import {
    CreateCommunityResult,
    CreateCommunityServerParams,
} from 'interfaces/account/createCommunity';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateChars } from 'test/utilities';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function createCommunity({
    socket,
    name,
    icon,
}: CreateCommunityServerParams): Promise<CreateCommunityResult | FronvoError> {
    name = name.replace(/\n/g, '');

    const accountData = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (accountData.isInCommunity) {
        return generateError('ALREADY_IN_COMMUNITY');
    }

    const communityId = generateChars(12);

    const communityData = await prismaClient.community.create({
        data: {
            communityId,
            ownerId: accountData.profileId,
            name,
            icon,
            members: [accountData.profileId],
            chatRequestsEnabled: true,
            acceptedChatRequests: [accountData.profileId],
            bannedMembers: [],
        },
        select: {
            communityId: true,
            ownerId: true,
            name: true,
            creationDate: true,
            icon: true,
            members: true,
            chatRequestsEnabled: true,
            acceptedChatRequests: true,
            bannedMembers: true,
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

    await socket.join(communityId);

    return { communityData };
}

const createCommunityTemplate: EventTemplate = {
    func: createCommunity,
    template: ['name', 'icon'],
    schema: new StringSchema({
        ...communityNameSchema,
        ...communityIconSchema,
    }),
};

export default createCommunityTemplate;
