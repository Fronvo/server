// ******************** //
// The fetchProfilePosts account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
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
    });

    if (!account) {
        return generateError('PROFILE_NOT_FOUND');
    }

    const isSelf = getSocketAccountId(socket.id) == profileId;
    const isFollower =
        !isSelf && account.following.includes(getSocketAccountId(socket.id));
    const isPrivate = account.isPrivate;
    const isAccessible = isSelf || !isPrivate || isFollower;

    if (!isAccessible) {
        return generateError('PROFILE_PRIVATE');
    }

    const fromNumber = Number(from);
    const toNumber = Number(to);

    if (fromNumber > toNumber) {
        return generateError(
            'NOT_HIGHER_NUMBER',
            { to: toNumber, from: fromNumber },
            ['to', 'from']
        );
    }

    if (toNumber - fromNumber > 20) {
        return generateError(
            'TOO_MUCH_LOAD',
            { to: toNumber, from: fromNumber },
            [20, 'posts']
        );
    }

    const profilePosts = await prismaClient.post.findMany({
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

    return { profilePosts: profilePosts.reverse() };
}

const fetchProfilePostsTemplate: EventTemplate = {
    func: fetchProfilePosts,
    template: ['profileId', 'from', 'to'],
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
        },

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

export default fetchProfilePostsTemplate;
