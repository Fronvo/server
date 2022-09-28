// ******************** //
// The fetchProfilePosts account-only event file.
// ******************** //

import { Account, Post } from '@prisma/client';
import {
    FetchHomePostsResult,
    FetchHomePostsServerParams,
} from 'interfaces/account/fetchHomePosts';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchProfilePosts({
    socket,
}: FetchHomePostsServerParams): Promise<FetchHomePostsResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    // Gather available account data (not private, or followed back)
    const postAccounts = [];
    const postProfileData: Partial<Account>[] = [];

    function getProfileData(author: string): Partial<Account> {
        for (const profileIndex in postProfileData) {
            const targetProfile = postProfileData[profileIndex];

            if (targetProfile.profileId == author) {
                return targetProfile;
            }
        }
    }

    // Add official posts to home posts
    if (!account.following.includes('fronvo')) {
        account.following.push('fronvo');
    }

    for (const followingIndex in account.following) {
        const followingData = await prismaClient.account.findFirst({
            where: {
                profileId: account.following[followingIndex] as string,
            },
            select: {
                avatar: true,
                bio: true,
                creationDate: true,
                followers: true,
                following: true,
                isPrivate: true,
                profileId: true,
                username: true,
            },
        });

        if (
            followingData.following.includes(getSocketAccountId(socket.id)) ||
            !followingData.isPrivate
        ) {
            postAccounts.push(followingData.profileId);
            postProfileData.push(followingData);
        }
    }

    const homePosts: { post: Post; profileData: Partial<Account> }[] = [];

    // Gather posts by available accounts ordered by date
    const posts = await prismaClient.post.findMany({
        where: {
            author: {
                in: postAccounts,
            },
        },

        skip: 0,

        // Max 50, then touch grass
        take: -50,

        // Newest posts first
        orderBy: {
            creationDate: 'asc',
        },
    });

    // Push post data with profile data
    for (const postIndex in posts) {
        const post = posts[postIndex];

        homePosts.push({
            post,
            profileData: getProfileData(post.author),
        });
    }

    return { homePosts };
}

const fetchProfileDataTemplate: EventTemplate = {
    func: fetchProfilePosts,
    template: [],
    points: 15,
};

export default fetchProfileDataTemplate;
