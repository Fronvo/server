// ******************** //
// The fetchProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Community } from '@prisma/client';
import {
    FetchedFronvoAccount,
    FetchProfileDataResult,
    FetchProfileDataServerParams,
} from 'interfaces/account/fetchProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchProfileData({
    socket,
    profileId,
}: FetchProfileDataServerParams): Promise<
    FetchProfileDataResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    let community: Community;

    if (!account) {
        return generateError('PROFILE_NOT_FOUND');
    }

    if (account.isInCommunity) {
        community = await prismaClient.community.findFirst({
            where: {
                communityId: account.communityId,
            },
        });
    }

    const isSelf = getSocketAccountId(socket.id) == profileId;
    const isFollower =
        !isSelf && account.following.includes(getSocketAccountId(socket.id));
    const isPrivate = account.isPrivate;
    const isAccessible = isSelf || !isPrivate || isFollower;

    let totalPosts = 0;
    let isInCommunity = false;
    let communityId = '';

    if (isAccessible) {
        totalPosts = await prismaClient.post.count({
            where: {
                author: profileId,
            },
        });
    }

    // Get community info
    if (account.isInCommunity) {
        const ourAccount = await prismaClient.account.findFirst({
            where: {
                profileId: getSocketAccountId(socket.id),
            },

            select: {
                isInCommunity: true,
                communityId: true,
            },
        });

        // Public account, see further down
        if (isAccessible) {
            // Invite only can't be seen on the profile
            // Unless it's us
            if (!community.inviteOnly || isSelf) {
                isInCommunity = true;
                communityId = account.communityId;
            }
        } else {
            // Now, we can only get info if we are in the same community
            if (account.communityId == ourAccount.communityId) {
                isInCommunity = true;
                communityId = account.communityId;
            }
        }
    }

    // Block access to most info if private
    const profileData: FetchedFronvoAccount = {
        isSelf,
        profileId: account.profileId,
        username: account.username,
        bio: account.bio,
        creationDate: (isAccessible && account.creationDate) || new Date(),
        avatar: account.avatar,
        banner: account.banner,
        following: (isAccessible && account.following) || [],
        followers: (isAccessible && account.followers) || [],
        totalPosts,
        isPrivate,
        isFollower,
        isInCommunity,
        communityId,

        isAdmin: account.isAdmin || account.profileId == 'fronvo',
        isDisabled: account.isDisabled || false,
    };

    // More data if our profile
    if (profileData.isSelf) {
        profileData.email = account.email;
    }

    return { profileData };
}

const fetchProfileDataTemplate: EventTemplate = {
    func: fetchProfileData,
    template: ['profileId'],
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
        },
    }),
};

export default fetchProfileDataTemplate;
