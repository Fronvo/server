// ******************** //
// The updateProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdOptionalSchema } from 'events/shared';
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
    banner,
    isPrivate,
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
        avatar != '' &&
        !banner &&
        banner != '' &&
        isPrivate == undefined
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

    if (isPrivate) {
        if (typeof isPrivate != 'boolean') {
            return generateError('NOT_BOOLEAN');
        }
    }

    const profileData = await prismaClient.account.update({
        data: {
            profileId,
            username,
            bio,
            avatar,
            banner,
            isPrivate,
        },
        where: {
            profileId: getSocketAccountId(socket.id),
        },
        select: {
            profileId: true,
            username: true,
            bio: true,
            avatar: true,
            banner: true,
            isPrivate: true,
            isInRoom: true,
            roomId: true,
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

        // Update follow relations
        function normalizeList(targetList: Array<string>): Array<string> {
            const resultList = targetList;

            const targetIndex = resultList.indexOf(
                getSocketAccountId(socket.id)
            );

            // Replace with new one
            resultList[targetIndex] = profileId;

            return resultList;
        }

        // Update following first
        const targetFollowingAccounts = await prismaClient.account.findMany({
            where: {
                followers: {
                    has: getSocketAccountId(socket.id),
                },
            },
        });

        for (const accountIndex in targetFollowingAccounts) {
            await prismaClient.account.update({
                where: {
                    profileId: targetFollowingAccounts[accountIndex].profileId,
                },
                data: {
                    followers: normalizeList(
                        targetFollowingAccounts[accountIndex]
                            .followers as string[]
                    ),
                },
            });
        }

        // Then followers
        const targetFollowers = await prismaClient.account.findMany({
            where: {
                following: {
                    has: getSocketAccountId(socket.id),
                },
            },
        });

        for (const accountIndex in targetFollowers) {
            await prismaClient.account.update({
                where: {
                    profileId: targetFollowers[accountIndex].profileId,
                },
                data: {
                    following: normalizeList(
                        targetFollowers[accountIndex].following as string[]
                    ),
                },
            });
        }

        // If currently in room, update members
        if (profileData.isInRoom) {
            const room = await prismaClient.room.findFirst({
                where: {
                    roomId: profileData.roomId,
                },
                select: {
                    members: true,
                },
            });

            const newMembers = room.members;

            newMembers.splice(
                newMembers.indexOf(getSocketAccountId(socket.id)),
                1
            );
            newMembers.push(profileId);

            await prismaClient.room.update({
                where: {
                    roomId: profileData.roomId,
                },
                data: {
                    members: newMembers,
                },
            });
        }

        // Update room messages
        await prismaClient.roomMessage.updateMany({
            where: {
                ownerId: getSocketAccountId(socket.id),
            },

            data: {
                ownerId: profileId,
            },
        });

        // Finally update socket link
        loggedInSockets[socket.id].accountId = profileId;
    }

    return { profileData };
}

const updateProfileDataTemplate: EventTemplate = {
    func: updateProfileData,
    template: ['profileId', 'username', 'bio', 'avatar', 'banner', 'isPrivate'],
    schema: new StringSchema({
        ...profileIdOptionalSchema,

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
            regex: /^(https:\/\/).+$/,
            maxLength: 512,
            optional: true,
        },

        banner: {
            // Ensure https
            regex: /^(https:\/\/).+$/,
            maxLength: 512,
            optional: true,
        },

        isPrivate: {
            optional: true,
        },
    }),
};

export default updateProfileDataTemplate;
