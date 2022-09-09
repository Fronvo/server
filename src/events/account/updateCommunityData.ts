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
        icon != ''
    ) {
        return {
            err: undefined,
        };
    }

    // Username validation not needed here, see schema below
    // Nor avatar, may need for content-type and extension if applicable (|| ?)

    // Check profile id availability
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
        },

        where: {
            communityId: previousCommunity.communityId,
        },

        select: {
            communityId: true,
            name: true,
            description: true,
            icon: true,
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
    }

    return { communityData };
}

const updateCommunityDataTemplate: EventTemplate = {
    func: updateCommunityData,
    template: ['communityId', 'name', 'description', 'icon'],
    points: 10,
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
    }),
};

export default updateCommunityDataTemplate;
