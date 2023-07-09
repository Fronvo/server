// ******************** //
// The fetchProfilePosts account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Account, Post } from '@prisma/client';
import { fromToSchema, profileIdSchema } from 'events/shared';
import {
    FetchProfilePostsResult,
    FetchProfilePostsServerParams,
} from 'interfaces/account/fetchProfilePosts';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchProfilePosts({
    socket,
    profileId,
    from,
    to,
}: FetchProfilePostsServerParams): Promise<
    FetchProfilePostsResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId,
        },

        select: {
            avatar: true,
            banner: true,
            bio: true,
            creationDate: true,
            profileId: true,
            username: true,
            friends: true,
        },
    });

    if (!account) {
        return generateError('ACCOUNT_404');
    }

    const isSelf = getSocketAccountId(socket.id) == profileId;
    const isFriend =
        !isSelf && account.friends.includes(getSocketAccountId(socket.id));
    const isAccessible = isSelf || isFriend;

    if (!isAccessible) {
        return generateError('NOT_FRIEND');
    }

    const fromNumber = Number(from);
    const toNumber = Number(to);

    // Get totalPosts
    const totalPosts = await prismaClient.post.count({
        where: {
            author: profileId,
        },
    });

    if (fromNumber > toNumber) {
        return generateError('NOT_HIGHER', { to: toNumber, from: fromNumber }, [
            'to',
            'from',
        ]);
    }

    if (toNumber - fromNumber > 20) {
        return generateError('TOO_MUCH', { to: toNumber, from: fromNumber }, [
            20,
            'posts',
        ]);
    }

    const profilePosts: {
        post: Partial<Post>;
        profileData: Partial<Account>;
    }[] = [];

    const posts = await prismaClient.post.findMany({
        where: {
            author: profileId,
        },

        // Last shown first
        // Cursor-based pagination is much more efficient but that would require dictionaries for each socket
        // Will consider in the future
        // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
        skip: fromNumber,

        // from: 5, to: 10 = 10 - 5 = 5 posts fetched after from pos
        take: -(toNumber - fromNumber),
        select: {
            postId: true,
            author: true,
            content: true,
            attachment: true,
            creationDate: true,
        },
    });

    // Push post data with profile data
    for (const postIndex in posts) {
        const post = posts[postIndex];

        profilePosts.push({
            post,
            profileData: account,
        });
    }

    return { profilePosts: profilePosts.reverse(), totalPosts };
}

const fetchProfilePostsTemplate: EventTemplate = {
    func: fetchProfilePosts,
    template: ['profileId', 'from', 'to'],
    schema: new StringSchema({
        ...profileIdSchema,
        ...fromToSchema,
    }),
};

export default fetchProfilePostsTemplate;
