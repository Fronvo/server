// ******************** //
// The fetchProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account } from '@prisma/client';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    FetchProfileDataGuestResult,
    FetchProfileDataGuestServerParams,
} from 'interfaces/noAccount/fetchProfileDataGuest';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchProfileDataGuest({
    profileId,
}: FetchProfileDataGuestServerParams): Promise<
    FetchProfileDataGuestResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!account) {
        return generateError('PROFILE_NOT_FOUND');
    }

    const isPrivate = account.isPrivate;
    const isAccessible = !isPrivate;

    // Block access to most info if private
    const profileData: Partial<Account> = {
        profileId: account.profileId,
        username: account.username,
        bio: account.bio,
        creationDate: isAccessible && account.creationDate,
        avatar: account.avatar,
        banner: account.banner,
        following: isAccessible && account.following,
        followers: isAccessible && account.followers,
        isPrivate,
        isAdmin: account.isAdmin || account.profileId == 'fronvo' || false,
        isDisabled: account.isDisabled || false,
    };

    return { profileData };
}

const fetchProfileDataGuestTemplate: EventTemplate = {
    func: fetchProfileDataGuest,
    template: ['profileId'],
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
        },
    }),
};

export default fetchProfileDataGuestTemplate;
