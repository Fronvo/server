// ******************** //
// The fetchProfilePosts account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account, Post } from '@prisma/client';
import { fromToSchema } from 'events/shared';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    FetchHomePostsGuestResult,
    FetchHomePostsGuestServerParams,
} from 'interfaces/noAccount/fetchHomePostsGuest';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchHomePostsGuest({
    from,
    to,
}: FetchHomePostsGuestServerParams): Promise<
    FetchHomePostsGuestResult | FronvoError
> {
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

    // Gather official Fronvo account data
    const postProfileData: Partial<Account>[] = [];

    function getProfileData(author: string): Partial<Account> {
        for (const profileIndex in postProfileData) {
            const targetProfile = postProfileData[profileIndex];

            if (targetProfile.profileId == author) {
                return targetProfile;
            }
        }
    }

    const officialAccount = await prismaClient.account.findFirst({
        where: {
            profileId: 'fronvo',
        },
    });

    postProfileData.push(officialAccount);

    const homePosts: { post: Partial<Post>; profileData: Partial<Account> }[] =
        [];

    // Get totalPosts
    const totalPosts = await prismaClient.post.count({
        where: {
            author: 'fronvo',
        },
    });

    // Gather posts by available accounts ordered by date
    const posts = await prismaClient.post.findMany({
        where: {
            author: 'fronvo',
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

const fetchHomePostsGuestTemplate: EventTemplate = {
    func: fetchHomePostsGuest,
    template: ['from', 'to'],
    schema: new StringSchema({
        ...fromToSchema,
    }),
};

export default fetchHomePostsGuestTemplate;
