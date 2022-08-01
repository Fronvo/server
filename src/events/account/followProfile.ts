// ******************** //
// The followProfile account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    FollowProfileResult,
    FollowProfileServerParams,
} from 'interfaces/account/followProfile';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function followProfile({
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
        return generateError('FOLLOW_SELF');
    }

    const followingData = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (followingData.following.includes(profileId)) {
        return generateError('ALREADY_FOLLOWING');
    }

    // Add to following
    await prismaClient.account.update({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
        data: {
            following: [...followingData.following, profileId],
        },
    });

    // Add to followers
    const profileData = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    await prismaClient.account.update({
        where: {
            profileId,
        },
        data: {
            followers: [
                ...profileData.followers,
                getSocketAccountId(socket.id),
            ],
        },
    });

    return {};
}

const fetchProfileIdTemplate: EventTemplate = {
    func: followProfile,
    template: ['profileId'],
    points: 2,
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
        },
    }),
};

export default fetchProfileIdTemplate;
