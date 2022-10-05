// ******************** //
// The unfollowProfile account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    FollowProfileResult,
    FollowProfileServerParams,
} from 'interfaces/account/followProfile';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function unfollowProfile({
    socket,
    profileId,
}: FollowProfileServerParams): Promise<FollowProfileResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!account) {
        return generateError('PROFILE_NOT_FOUND');
    }

    if (profileId == getSocketAccountId(socket.id)) {
        return generateError('UNFOLLOW_SELF');
    }

    const followingData = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (!followingData.following.includes(profileId)) {
        return generateError('ALREADY_UNFOLLOWING');
    }

    // Remove from following
    const following = followingData.following;
    following.splice(following.indexOf(profileId), 1);

    await prismaClient.account.update({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
        data: {
            following,
        },
    });

    // Remove from followers
    const profileData = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    const followers = profileData.followers;
    followers.splice(followers.indexOf(getSocketAccountId(socket.id)), 1);

    await prismaClient.account.update({
        where: {
            profileId,
        },
        data: {
            followers,
        },
    });

    return {};
}

const fetchProfileIdTemplate: EventTemplate = {
    func: unfollowProfile,
    template: ['profileId'],
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
        },
    }),
};

export default fetchProfileIdTemplate;
