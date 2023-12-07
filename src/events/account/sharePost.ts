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
import { generateError, sendMulticastFCM } from 'utilities/global';
import { v4 } from 'uuid';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function sharePost({
    io,
    account,
    attachment,
}: SharePostServerParams): Promise<SharePostResult | FronvoError> {
    // Must have content if not an attachment inside
    if (!attachment) {
        return generateError('REQUIRED', undefined, ['attachment']);
    }

    // Free limit: Post cooldown for 10 minutes, PRO limit: none
    if (!account.isPRO) {
        if (differenceInMinutes(new Date(), account.lastPostAt) < 10) {
            return generateError('DO_AGAIN', undefined, [
                10 - differenceInMinutes(new Date(), account.lastPostAt),
                'minutes',
            ]);
        } else {
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
        }
    }

    const createdPost = await prismaClient.post.create({
        data: {
            postId: v4(),
            author: account.profileId,
            attachment,
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
    template: ['attachment'],
    schema: new StringSchema({
        attachment: {
            optional: true,
            regex: /https:\/\/ik.imagekit.io\/fronvo(2)?\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/,
        },
    }),
};

export default sharePostTemplate;
