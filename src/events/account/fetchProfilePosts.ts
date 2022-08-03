// ******************** //
// The fetchProfileData account-only event file.
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

    const profilePosts = await prismaClient.post.findMany({
        where: {
            author: profileId,
        },

        // Last shown first
        // Cursor-based pagination is much more efficient but that would require dictionaries for each socket
        // Will consider in the future
        // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
        skip: -Number(from),
        take: -Number(to),
        select: {
            postId: true,
            author: true,
            title: true,
            content: true,
            attachment: true,
            creationDate: true,
        },
    });

    return { profilePosts };
}

const fetchProfileDataTemplate: EventTemplate = {
    func: fetchProfilePosts,
    template: ['profileId', 'from', 'to'],
    points: 3,
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
        },

        from: {
            minLength: 1,
            maxLength: 3,
            regex: /^[0-9]+$/,
        },

        to: {
            minLength: 1,
            maxLength: 3,
            regex: /^[0-9]+$/,
        },
    }),
};

export default fetchProfileDataTemplate;
