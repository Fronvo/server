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

    let totalPosts: number = 0;

    if (isAccessible) {
        totalPosts = await prismaClient.post.count({
            where: {
                author: profileId,
            },
        });
    }

    // Block access to most info if private
    const profileData: FetchedFronvoAccount = {
        isSelf,
        profileId: account.profileId,
        username: account.username,
        bio: isAccessible && account.bio,
        creationDate: isAccessible && account.creationDate,
        avatar: account.avatar,
        banner: account.banner,
        following: isAccessible && account.following,
        followers: isAccessible && account.followers,
        totalPosts,
        isPrivate,
        isFollower,
        isInCommunity:
            (isAccessible &&
                (!community?.inviteOnly || isSelf) &&
                account.isInCommunity) ||
            false,
        communityId:
            isAccessible &&
            (!community?.inviteOnly || isSelf) &&
            account.communityId,
        isAdmin: account.isAdmin || account.profileId == 'fronvo' || false,
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
