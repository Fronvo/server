// ******************** //
// The sharePost account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    SharePostResult,
    SharePostServerParams,
} from 'interfaces/account/sharePost';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function sharePost({
    io,
    socket,
    content,
    attachment,
    gif,
}: SharePostServerParams): Promise<SharePostResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    // Must have content if not an attachment inside
    if (!gif && !attachment && !content) {
        return generateError('REQUIRED', undefined, ['content']);
    }

    if (attachment && gif) {
        return generateError('POST_BOTH_TYPES');
    }

    if (!content) content = '';
    if (!attachment) attachment = '';
    if (!gif) gif = '';

    const createdPost = await prismaClient.post.create({
        data: {
            postId: v4(),
            author: account.profileId,
            content,
            attachment,
            gif,
        },
    });

    io.to(account.profileId).emit('postShared', {
        postId: createdPost.postId,
        author: account.profileId,
    });

    return {};
}

const sharePostTemplate: EventTemplate = {
    func: sharePost,
    template: ['content', 'attachment', 'gif'],
    schema: new StringSchema({
        content: {
            minLength: 1,
            maxLength: 500,
            optional: true,
        },

        attachment: {
            optional: true,
            regex: /https:\/\/ik.imagekit.io\/fronvo\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/,
        },

        gif: {
            optional: true,
            regex: /https:\/\/media.tenor.com\/[a-zA-Z0-9_-]{16}\/[a-zA-Z0-9-_]+.gif/,
        },
    }),
};

export default sharePostTemplate;
