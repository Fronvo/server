// ******************** //
// The fetchHomePosts account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account } from '@prisma/client';
import { fromToSchema } from 'events/shared';
import {
    FetchHomePostsResult,
    FetchHomePostsServerParams,
} from 'interfaces/account/fetchHomePosts';
import { FetchedFronvoAccount } from 'interfaces/account/fetchProfileData';
import { FetchedFronvoPost } from 'interfaces/account/fetchProfilePosts';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { decryptAES, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchHomePosts({
    socket,
    account,
    from,
    to,
}: FetchHomePostsServerParams): Promise<FetchHomePostsResult | FronvoError> {
    const fromNumber = Number(from);
    const toNumber = Number(to);

    if (fromNumber > toNumber) {
        return generateError('NOT_HIGHER', { to: toNumber, from: fromNumber }, [
            'to',
            'from',
        ]);
    }

    if (toNumber - fromNumber > 30) {
        return generateError('TOO_MUCH', { to: toNumber, from: fromNumber }, [
            30,
            'posts',
        ]);
    }

    // Gather available account data (not private, or followed back)
    const postAccounts = [];
    const postProfileData: Partial<FetchedFronvoAccount>[] = [];

    function getProfileData(author: string): Partial<Account> {
        for (const profileIndex in postProfileData) {
            const targetProfile = postProfileData[profileIndex];

            if (targetProfile.profileId == author) {
                return targetProfile;
            }
        }
    }

    async function getFriendsAccounts(): Promise<void> {
        return new Promise(async (resolve) => {
            if (account.friends.length == 0) {
                resolve();
                return;
            }

            for (const friendIndex in account.friends) {
                if (!postAccounts.includes(account.friends[friendIndex])) {
                    prismaClient.account
                        .findFirst({
                            where: {
                                profileId: account.friends[
                                    friendIndex
                                ] as string,
                            },

                            select: {
                                avatar: true,
                                banner: true,
                                bio: true,
                                creationDate: true,
                                profileId: true,
                                username: true,
                                isPRO: true,
                            },
                        })
                        .then((friendData) => {
                            prismaClient.post
                                .count({
                                    where: {
                                        author: account.friends[
                                            friendIndex
                                        ] as string,
                                    },
                                })
                                .then((totalPosts) => {
                                    postAccounts.push(friendData.profileId);
                                    postProfileData.push({
                                        ...friendData,
                                        totalPosts,
                                    });

                                    if (
                                        postAccounts.length ==
                                        account.friends.length
                                    ) {
                                        resolve();
                                        return;
                                    }
                                });
                        });
                } else {
                    postAccounts.push(account.friends[friendIndex]);
                }
            }
        });
    }

    await getFriendsAccounts();

    const homePosts: {
        post: FetchedFronvoPost;
        profileData: Partial<Account>;
    }[] = [];

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
            likes: true,
            gif: true,
        },
    });

    // Push post data with profile data, join all post rooms
    for (const postIndex in posts) {
        const post = posts[postIndex];

        homePosts.push({
            post: {
                ...post,
                totalLikes: post.likes.length,
                likes: undefined,
                isLiked: post.likes.includes(account.profileId),
                content: post.content ? decryptAES(post.content) : undefined,
            },
            profileData: getProfileData(post.author),
        });

        socket.join(post.postId);
    }

    return { homePosts: homePosts.reverse(), totalPosts };
}

const fetchHomePostsTemplate: EventTemplate = {
    func: fetchHomePosts,
    template: ['from', 'to'],
    schema: new StringSchema({
        ...fromToSchema,
    }),
};

export default fetchHomePostsTemplate;
