// ******************** //
// The updateProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    UpdateProfileDataResult,
    UpdateProfileDataServerParams,
} from 'interfaces/account/updateProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { loggedInSockets, prismaClient } from 'variables/global';

async function updateProfileData({
    socket,
    profileId,
    username,
    bio,
    avatar,
}: UpdateProfileDataServerParams): Promise<
    UpdateProfileDataResult | FronvoError
> {
    // If none provided, return immediately
    if (
        !profileId &&
        !username &&
        !bio &&
        bio != '' &&
        !avatar &&
        avatar != ''
    ) {
        return {
            err: undefined,
        };
    }

    // Username validation not needed here, see schema below
    // Nor avatar, may need for content-type and extension if applicable (|| ?)

    // Check profile id availability
    if (profileId) {
        const profileIdData = await prismaClient.account.findFirst({
            where: {
                profileId,
            },
        });

        if (profileIdData) {
            return generateError('INVALID_PROFILE_ID');
        }
    }

    const profileData = await prismaClient.account.update({
        data: {
            profileId,
            username,
            bio,
            avatar,
        },
        where: {
            profileId: getSocketAccountId(socket.id),
        },
        select: {
            profileId: true,
            username: true,
            bio: true,
            avatar: true,
        },
    });

    if (profileId) {
        // Update related entries

        // Update posts
        await prismaClient.post.updateMany({
            where: {
                author: getSocketAccountId(socket.id),
            },

            data: {
                author: profileId,
            },
        });

        // Update token
        await prismaClient.token.update({
            where: {
                profileId: getSocketAccountId(socket.id),
            },

            data: {
                profileId,
            },
        });

        // Finally update socket link
        loggedInSockets[socket.id].accountId = profileId;
    }

    return { profileData };
}

const updateProfileDataTemplate: EventTemplate = {
    func: updateProfileData,
    template: ['profileId', 'username', 'bio', 'avatar'],
    points: 3,
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
            optional: true,
        },

        username: {
            minLength: 5,
            maxLength: 30,
            optional: true,
        },

        bio: {
            maxLength: 128,
            optional: true,
        },

        avatar: {
            // Ensure https
            regex: /^(https:\/\/).+$/,
            maxLength: 512,
            optional: true,
        },
    }),
};

export default updateProfileDataTemplate;
