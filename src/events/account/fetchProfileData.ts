// ******************** //
// The fetchProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { differenceInHours } from 'date-fns';
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
        return generateError('INVALID', undefined, ['profile ID']);
    }

    const isSelf = getSocketAccountId(socket.id) == profileId;
    const isFriend = account.friends.includes(getSocketAccountId(socket.id));
    const isAccessible = isSelf || isFriend;

    // ignore given status if set >24 hours
    let showStatus = false;

    if (account.statusUpdatedTime) {
        if (
            differenceInHours(new Date(), new Date(account.statusUpdatedTime)) <
            24
        ) {
            showStatus = true;
        }
    }

    let totalPosts: number;

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
        creationDate: account.creationDate || new Date(),
        avatar: account.avatar,
        banner: account.banner,
        online: getAccountSocketId(profileId) != '',
        status: showStatus ? account.status : '',
        totalPosts,
        isPRO: account.isPRO,
    };

    // More data if our profile
    if (profileData.isSelf) {
        // Unused
        // profileData.email = account.email;
        profileData.pendingFriendRequests = account.pendingFriendRequests;
        profileData.friends = account.friends;

        // Unusable if unsubscribed
        if (account.isPRO) {
            if (account.appliedTheme) {
                const theme = await prismaClient.theme.findFirst({
                    where: {
                        title: account.appliedTheme,
                    },
                });

                profileData.appliedTheme = account.appliedTheme;
                profileData.bW = theme.brandingWhite;
                profileData.bDW = theme.brandingDarkenWhite;
                profileData.bD = theme.brandingDark;
                profileData.bDD = theme.brandingDarkenDark;
            }
        }
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
