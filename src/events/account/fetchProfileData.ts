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

    // TODO: Check if private, if so, return even fewer items
    const profileData: FetchedFronvoAccount = {
        isSelf: getSocketAccountId(socket.id) == profileId,
        profileId: account.profileId,
        username: account.username,
        bio: account.bio,
        creationDate: account.creationDate,
        avatar: account.avatar,
        following: account.following,
        followers: account.followers,
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
            regex: /^[a-z0-9]+$/,
        },
    }),
};

export default fetchProfileDataTemplate;
