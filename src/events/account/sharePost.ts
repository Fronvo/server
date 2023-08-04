// ******************** //
// The sharePost account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { differenceInMinutes } from 'date-fns';
import {
    SharePostResult,
    SharePostServerParams,
} from 'interfaces/account/sharePost';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { encryptAES, generateError, sendMulticastFCM } from 'utilities/global';
import { v4 } from 'uuid';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function sharePost({
    io,
    account,
    content,
    attachment,
    gif,
}: SharePostServerParams): Promise<SharePostResult | FronvoError> {
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

    // Free limit: Post cooldown for 10 minutes, PRO limit: none
    if (!account.isPRO) {
        if (differenceInMinutes(new Date(), account.lastPostAt) < 10) {
            return generateError('DO_AGAIN', undefined, [
                10 - differenceInMinutes(new Date(), account.lastPostAt),
                'minutes',
            ]);
        }
    }

    if (!account.isPRO) {
        setTimeout(async () => {
            try {
                await prismaClient.account.update({
                    where: {
                        profileId: account.profileId,
                    },

                    data: {
                        lastPostAt: new Date(),
                    },
                });
            } catch (e) {}
        }, batchUpdatesDelay);
    }

    const createdPost = await prismaClient.post.create({
        data: {
            postId: v4(),
            author: account.profileId,
            content: content ? encryptAES(content) : undefined,
            attachment,
            gif,
            likes: [account.profileId],
        },
    });

    io.to(account.profileId).emit('postShared', {
        postId: createdPost.postId,
        author: account.profileId,
    });

    sendMulticastFCM(
        account.friends as string[],
        'New post',
        `@${account.profileId} shared a new post`,
        account.profileId,
        false
    );

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
            regex: /https:\/\/ik.imagekit.io\/fronvo(2)?\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/,
        },

        gif: {
            optional: true,
            regex: /https:\/\/media.tenor.com\/[a-zA-Z0-9_-]{16}\/[a-zA-Z0-9-_]+.gif/,
        },
    }),
};

export default sharePostTemplate;
