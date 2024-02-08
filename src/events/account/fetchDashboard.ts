// ******************** //
// The fetchDashboard account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account } from '@prisma/client';
import { fromToSchema } from 'events/shared';
import {
    FetchDashboardResult,
    FetchDashboardServerParams,
} from 'interfaces/account/fetchDashboard';
import { FetchedFronvoAccount } from 'interfaces/account/fetchProfileData';
import { FetchedFronvoPost } from 'interfaces/account/fetchProfilePosts';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchDashboard({
    socket,
    account,
    from,
    to,
}: FetchDashboardServerParams): Promise<FetchDashboardResult | FronvoError> {
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
                                turbo: true,
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

    const dashboard: {
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
            author: true,
            attachment: true,
            creationDate: true,
            likes: true,
        },
    });

    // Push post data with profile data, join all post rooms
    for (const postIndex in posts) {
        const post = posts[postIndex];

        const profileData = getProfileData(post.author);

        dashboard.push({
            post: {
                ...post,
                totalLikes: post.likes.length,
                likes: undefined,
                isLiked: post.likes.includes(account.profileId),
            },
            profileData: {
                ...profileData,
                avatar: profileData.avatar,
            },
        });

        socket.join(post.postId);
    }

    return { dashboard: dashboard.reverse(), totalPosts };
}

const fetchDashboardTemplate: EventTemplate = {
    func: fetchDashboard,
    template: ['from', 'to'],
    schema: new StringSchema({
        ...fromToSchema,
    }),
};

export default fetchDashboardTemplate;
