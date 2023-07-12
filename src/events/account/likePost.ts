// ******************** //
// The likePost account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { postIdSchema } from 'events/shared';
import {
    LikePostResult,
    LikePostServerParams,
} from 'interfaces/account/likePost';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function likePost({
    io,
    socket,
    postId,
}: LikePostServerParams): Promise<LikePostResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    // Must exist
    const post = await prismaClient.post.findFirst({
        where: {
            postId,
        },

        select: {
            postId: true,
            author: true,
            likes: true,
        },
    });

    if (!post) {
        return generateError('POST_404');
    }

    const postAuthor = await prismaClient.account.findFirst({
        where: {
            profileId: post.author,
        },
    });

    // Must be friends / self
    if (
        !postAuthor.friends.includes(account.profileId) &&
        !(account.profileId == postAuthor.profileId)
    ) {
        return generateError('NOT_FRIEND');
    }

    // No unlikePost event, decide here
    try {
        if (post.likes.includes(account.profileId)) {
            const newLikes = post.likes;
            newLikes.splice(newLikes.indexOf(account.profileId), 1);

            await prismaClient.post.update({
                where: {
                    postId,
                },

                data: {
                    likes: newLikes,
                },
            });

            io.to(post.postId).emit('postLikesChanged', {
                postId: post.postId,
                likes: newLikes as string[],
            });
        } else {
            await prismaClient.post.update({
                where: {
                    postId,
                },

                data: {
                    likes: {
                        push: account.profileId,
                    },
                },
            });

            io.to(post.postId).emit('postLikesChanged', {
                postId: post.postId,
                likes: [...(post.likes as string[]), account.profileId],
            });
        }
    } catch (e) {}

    return {};
}

const likePostTemplate: EventTemplate = {
    func: likePost,
    template: ['postId'],
    schema: new StringSchema({
        ...postIdSchema,
    }),
};

export default likePostTemplate;
