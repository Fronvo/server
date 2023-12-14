// ******************** //
// The updateProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account } from '@prisma/client';
import {
    UpdateProfileDataResult,
    UpdateProfileDataServerParams,
} from 'interfaces/account/updateProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { deleteImage, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function updateProfileData({
    io,
    account,
    username,
    bio,
    avatar,
    banner,
}: UpdateProfileDataServerParams): Promise<
    UpdateProfileDataResult | FronvoError
> {
    // If none provided, return immediately
    if (
        !username &&
        !bio &&
        bio != '' &&
        !avatar &&
        avatar != '' &&
        !banner &&
        banner != ''
    ) {
        return {
            err: undefined,
        };
    }

    // Free limit: No banner update
    if (!account.turbo && banner) {
        return generateError('PRO_REQUIRED');
    }

    if (account.banner?.length > 0 && banner?.length > 0) {
        deleteImage(account.banner);
    }

    if (account.avatar?.length > 0 && avatar?.length > 0) {
        deleteImage(account.avatar);
    }

    let profileData: Partial<Account>;

    try {
        profileData = await prismaClient.account.update({
            data: {
                username,
                bio,
                avatar,
                banner,
            },

            where: {
                profileId: account.profileId,
            },

            select: {
                profileId: true,
                username: true,
                bio: true,
                avatar: true,
                banner: true,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    io.to(account.profileId).emit('profileDataUpdated', {
        profileId: account.profileId,
        username: username ? username : profileData.username,
        bio: bio ? bio : profileData.bio,
        avatar: avatar ? avatar : profileData.avatar,
        banner: banner ? banner : profileData.banner,
    });

    return { profileData };
}

const updateProfileDataTemplate: EventTemplate = {
    func: updateProfileData,
    template: ['username', 'bio', 'avatar', 'banner', 'isPrivate'],
    schema: new StringSchema({
        username: {
            minLength: 1,
            maxLength: 30,
            optional: true,
        },

        bio: {
            maxLength: 128,
            optional: true,
        },

        avatar: {
            // Ensure https
            regex: /https:\/\/ik.imagekit.io\/fronvo(2)?\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/,
            optional: true,
        },

        banner: {
            // Ensure https
            regex: /https:\/\/ik.imagekit.io\/fronvo(2)?\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/,
            optional: true,
        },

        isPrivate: {
            optional: true,
        },
    }),
};

export default updateProfileDataTemplate;
