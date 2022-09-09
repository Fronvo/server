// ******************** //
// The fetchProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
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

    if (!account) {
        return generateError('PROFILE_NOT_FOUND');
    }

    const isSelf = getSocketAccountId(socket.id) == profileId;
    const isFollower =
        !isSelf && account.following.includes(getSocketAccountId(socket.id));
    const isPrivate = account.isPrivate;
    const isAccessible = isSelf || !isPrivate || isFollower;

    // Block access to most info if private
    const profileData: FetchedFronvoAccount = {
        isSelf,
        profileId: account.profileId,
        username: account.username,
        bio: isAccessible && account.bio,
        creationDate: isAccessible && account.creationDate,
        avatar: account.avatar,
        following: isAccessible && account.following,
        followers: isAccessible && account.followers,
        isPrivate,
        isFollower,
        isInCommunity: isAccessible && account.isInCommunity,
        communityId: isAccessible && account.communityId,
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
    points: 3,
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
        },
    }),
};

export default fetchProfileDataTemplate;
