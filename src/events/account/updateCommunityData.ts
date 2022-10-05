// ******************** //
// The updateProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    UpdateCommunityDataResult,
    UpdateCommunityDataServerParams,
} from 'interfaces/account/updateCommunityData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function updateCommunityData({
    socket,
    communityId,
    name,
    description,
    icon,
    inviteOnly,
}: UpdateCommunityDataServerParams): Promise<
    UpdateCommunityDataResult | FronvoError
> {
    // If none provided, return immediately
    if (
        !communityId &&
        !name &&
        !description &&
        description != '' &&
        !icon &&
        icon != '' &&
        inviteOnly == undefined
    ) {
        return {
            err: undefined,
        };
    }

    // Name validation not needed here, see schema below
    // Nor icon, may need for content-type and extension if applicable (|| ?)

    // Check community id availability
    if (communityId) {
        const communityIdData = await prismaClient.community.findFirst({
            where: {
                communityId,
            },
        });

        if (communityIdData) {
            return generateError('INVALID_COMMUNITY_ID');
        }
    }

    if (inviteOnly) {
        if (typeof inviteOnly != 'boolean') {
            return generateError('NOT_BOOLEAN');
        }
    }

    // Fetch old community id
    const accountData = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        select: {
            communityId: true,
        },
    });

    const previousCommunity = await prismaClient.community.findFirst({
        where: {
            communityId: accountData.communityId,
        },
    });

    const communityData = await prismaClient.community.update({
        data: {
            communityId,
            name,
            description,
            icon,
            inviteOnly,
        },

        where: {
            communityId: previousCommunity.communityId,
        },

        select: {
            communityId: true,
            name: true,
            description: true,
            icon: true,
            inviteOnly: true,
        },
    });

    if (communityId) {
        // Update related entries

        // Update accounts
        await prismaClient.account.updateMany({
            where: {
                communityId: previousCommunity.communityId,
            },

            data: {
                communityId,
            },
        });

        // Update messages
        await prismaClient.communityMessage.updateMany({
            where: {
                communityId: previousCommunity.communityId,
            },

            data: {
                communityId,
            },
        });
    }

    return { communityData };
}

const updateCommunityDataTemplate: EventTemplate = {
    func: updateCommunityData,
    template: ['communityId', 'name', 'description', 'icon', 'inviteOnly'],
    schema: new StringSchema({
        communityId: {
            minLength: 5,
            maxLength: 15,
            regex: /^[a-z0-9]+$/,
            optional: true,
        },

        name: {
            minLength: 5,
            maxLength: 15,
            optional: true,
        },

        description: {
            minLength: 15,
            maxLength: 50,
            optional: true,
        },

        icon: {
            // Ensure https
            regex: /^(https:\/\/).+$/,
            maxLength: 512,
            optional: true,
        },

        inviteOnly: {
            optional: true,
        },
    }),
};

export default updateCommunityDataTemplate;
