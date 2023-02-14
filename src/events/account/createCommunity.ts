// ******************** //
// The createCommunity account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
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
    description,
    icon,
}: CreateCommunityServerParams): Promise<CreateCommunityResult | FronvoError> {
    name = name.replace(/\n/g, '');
    description = description.replace(/\n\n/g, '\n');

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
            description,
            icon,
            members: [accountData.profileId],
            acceptedChatRequests: [accountData.profileId],
            bannedMembers: [],
        },
        select: {
            communityId: true,
            ownerId: true,
            name: true,
            description: true,
            creationDate: true,
            icon: true,
            members: true,
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
    template: ['name', 'description', 'icon'],
    schema: new StringSchema({
        name: {
            minLength: 3,
            maxLength: 15,
        },

        description: {
            minLength: 5,
            maxLength: 50,
        },

        icon: {
            maxLength: 512,
            regex: /^(https:\/\/).+$/,
            optional: true,
        },
    }),
};

export default createCommunityTemplate;
