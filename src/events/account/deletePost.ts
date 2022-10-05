// ******************** //
// The deletePost account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    DeletePostResult,
    DeletePostServerParams,
} from 'interfaces/account/deletePost';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function deletePost({
    socket,
    postId,
}: DeletePostServerParams): Promise<DeletePostResult | FronvoError> {
    const deletedPost = await prismaClient.post.deleteMany({
        where: {
            AND: [
                {
                    author: getSocketAccountId(socket.id),
                },
                {
                    postId,
                },
            ],
        },
    });

    if (deletedPost.count == 0) {
        return generateError('INVALID_POST');
    }

    return {};
}

const deletePostTemplate: EventTemplate = {
    func: deletePost,
    template: ['postId'],
    schema: new StringSchema({
        postId: {
            type: 'uuid',
        },
    }),
};

export default deletePostTemplate;
