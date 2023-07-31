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
import { generateError, getAccountSocketId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchProfileData({
    profileId,
    account,
}: FetchProfileDataServerParams): Promise<
    FetchProfileDataResult | FronvoError
> {
    const targetAccount = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!targetAccount) {
        return generateError('ACCOUNT_404');
    }

    const isSelf = account.profileId == profileId;
    const isFriend = account.friends.includes(targetAccount.profileId);
    const isAccessible = isSelf || isFriend;

    // ignore given status if set >24 hours
    let showStatus = false;

    if (targetAccount.statusUpdatedTime) {
        if (
            differenceInHours(
                new Date(),
                new Date(targetAccount.statusUpdatedTime)
            ) < 24
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
        profileId: targetAccount.profileId,
        username: targetAccount.username,
        bio: targetAccount.bio,
        creationDate: targetAccount.creationDate || new Date(),
        avatar: targetAccount.avatar,
        banner: targetAccount.banner,
        online: getAccountSocketId(profileId) != '',
        status: showStatus ? targetAccount.status : '',
        totalPosts,
        isPRO: targetAccount.isPRO,
    };

    // More data if our profile
    if (profileData.isSelf) {
        // Unused
        // profileData.email = account.email;
        profileData.pendingFriendRequests = targetAccount.pendingFriendRequests;
        profileData.friends = account.friends;

        // Unusable if unsubscribed
        if (targetAccount.isPRO) {
            if (targetAccount.appliedTheme) {
                const theme = await prismaClient.theme.findFirst({
                    where: {
                        title: targetAccount.appliedTheme,
                    },
                });

                // Might have changed title
                if (theme) {
                    profileData.appliedTheme = targetAccount.appliedTheme;
                    profileData.bW = theme.brandingWhite;
                    profileData.bDW = theme.brandingDarkenWhite;
                    profileData.bD = theme.brandingDark;
                    profileData.bDD = theme.brandingDarkenDark;
                }
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
    fetchAccount: true,
};

export default fetchProfileDataTemplate;
