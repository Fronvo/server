// ******************** //
// The createPost account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    CreatePostResult,
    CreatePostServerParams,
} from 'interfaces/account/createPost';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function createPost({
    socket,
    attachment,
    content,
}: CreatePostServerParams): Promise<CreatePostResult | FronvoError> {
    content = content.replace(/\n\n/g, '\n');

    const postData = await prismaClient.post.create({
        data: {
            author: getSocketAccountId(socket.id),
            content,
            attachment,
        },
        select: {
            postId: true,
            author: true,
            content: true,
            attachment: true,
            creationDate: true,
        },
    });

    return { postData };
}

const createPostTemplate: EventTemplate = {
    func: createPost,
    template: ['content', 'attachment'],
    schema: new StringSchema({
        content: {
            minLength: 1,
            maxLength: 512,
        },

        attachment: {
            maxLength: 512,
            regex: /^(https:\/\/).+$/,
            optional: true,
        },
    }),
};

export default createPostTemplate;
