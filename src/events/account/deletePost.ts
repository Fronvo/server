// ******************** //
// The deletePost account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { postIdSchema } from 'events/shared';
import {
    DeletePostResult,
    DeletePostServerParams,
} from 'interfaces/account/deletePost';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { deleteImage, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function deletePost({
    io,
    account,
    postId,
}: DeletePostServerParams): Promise<DeletePostResult | FronvoError> {
    const post = await prismaClient.post.findFirst({
        where: {
            postId,
        },
    });

    if (!post) {
        return generateError('POST_404');
    }

    if (post.author != account.profileId) {
        return generateError('NOT_POST_CREATOR');
    }

    if (post.attachment?.length > 0) {
        deleteImage(post.attachment);
    }

    await prismaClient.post.delete({
        where: {
            postId,
        },
    });

    io.to(account.profileId).emit('postRemoved', {
        postId,
    });

    return {};
}

const deletePostTemplate: EventTemplate = {
    func: deletePost,
    template: ['postId'],
    schema: new StringSchema({
        ...postIdSchema,
    }),
};

export default deletePostTemplate;
