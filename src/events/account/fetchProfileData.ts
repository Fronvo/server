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
        isTurbo: targetAccount.turbo || targetAccount.profileId == 'fronvo',
        hasSpotify: targetAccount.hasSpotify,
        spotifyName: targetAccount.spotifyName,
        spotifyURL: targetAccount.spotifyURL,
        hasGithub: targetAccount.hasGithub,
        githubName: targetAccount.githubName,
        githubURL: targetAccount.githubURL,
    };

    // More data if our profile
    if (profileData.isSelf) {
        // Unused
        // profileData.email = account.email;
        profileData.pendingFriendRequests = targetAccount.pendingFriendRequests;
        profileData.friends = account.friends;
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
