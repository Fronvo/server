// ******************** //
// The fetchProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    FetchedFronvoAccount,
    FetchProfileDataResult,
    FetchProfileDataServerParams,
} from 'interfaces/account/fetchProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getAccountSocketId,
    getSocketAccountId,
} from 'utilities/global';
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

    if (!account) {
        return generateError('PROFILE_NOT_FOUND');
    }

    const isSelf = getSocketAccountId(socket.id) == profileId;
    const isFollower =
        !isSelf && account.following.includes(getSocketAccountId(socket.id));
    const isPrivate = account.isPrivate;
    const isAccessible = isSelf || !isPrivate || isFollower;

    let totalPosts = 0;

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
        bio: account.bio,
        creationDate: (isAccessible && account.creationDate) || new Date(),
        avatar: account.avatar,
        banner: account.banner,
        following: (isAccessible && account.following) || [],
        followers: (isAccessible && account.followers) || [],
        totalPosts,
        isPrivate,
        isFollower,
        isAdmin: account.isAdmin || account.profileId == 'fronvo',
        isDisabled: account.isDisabled || false,

        // No accessibility checks, think about it
        online: getAccountSocketId(profileId) != '',
        lastOnline: account.lastOnline,
    };

    // More data if our profile
    if (profileData.isSelf) {
        profileData.email = account.email;
        profileData.isInCommunity = account.isInCommunity;
        profileData.communityId = account.communityId;
    }

    return { profileData };
}

const fetchProfileDataTemplate: EventTemplate = {
    func: fetchProfileData,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default fetchProfileDataTemplate;
