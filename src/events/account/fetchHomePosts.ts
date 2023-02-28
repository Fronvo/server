// ******************** //
// The fetchProfilePosts account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account, Post } from '@prisma/client';
import {
    FetchHomePostsResult,
    FetchHomePostsServerParams,
} from 'interfaces/account/fetchHomePosts';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchProfilePosts({
    socket,
    from,
    to,
}: FetchHomePostsServerParams): Promise<FetchHomePostsResult | FronvoError> {
    const fromNumber = Number(from);
    const toNumber = Number(to);

    if (fromNumber > toNumber) {
        return generateError(
            'NOT_HIGHER_NUMBER',
            { to: toNumber, from: fromNumber },
            ['to', 'from']
        );
    }

    if (toNumber - fromNumber > 30) {
        return generateError(
            'TOO_MUCH_LOAD',
            { to: toNumber, from: fromNumber },
            [30, 'posts']
        );
    }

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
                banner: true,
                bio: true,
                creationDate: true,
                followers: true,
                following: true,
                isPrivate: true,
                profileId: true,
                username: true,
                isAdmin: true,
                isDisabled: true,
                isInCommunity: true,
                communityId: true,
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

    const homePosts: { post: Partial<Post>; profileData: Partial<Account> }[] =
        [];

    // Get totalPosts
    const totalPosts = await prismaClient.post.count({
        where: {
            author: {
                in: postAccounts,
            },
        },
    });

    // Gather posts by available accounts ordered by date
    const posts = await prismaClient.post.findMany({
        where: {
            author: {
                in: postAccounts,
            },
        },

        // Last shown first
        // Cursor-based pagination is much more efficient but that would require dictionaries for each socket
        // Will consider in the future
        // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
        skip: fromNumber,

        // from: 5, to: 10 = 10 - 5 = 5 posts fetched after from pos
        take: -(toNumber - fromNumber),

        // Newest posts first
        orderBy: {
            creationDate: 'asc',
        },

        select: {
            postId: true,
            content: true,
            author: true,
            attachment: true,
            creationDate: true,
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

    return { homePosts: homePosts.reverse(), totalPosts };
}

const fetchProfileDataTemplate: EventTemplate = {
    func: fetchProfilePosts,
    template: ['from', 'to'],
    schema: new StringSchema({
        from: {
            minLength: 1,
            maxLength: 7,
            regex: /^[0-9]+$/,
        },

        to: {
            minLength: 1,
            maxLength: 7,
            regex: /^[0-9]+$/,
        },
    }),
};

export default fetchProfileDataTemplate;
