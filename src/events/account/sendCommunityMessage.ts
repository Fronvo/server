// ******************** //
// The sendCommunityMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    SendCommunityMessageResult,
    SendCommunityMessageServerParams,
} from 'interfaces/account/sendCommunityMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getSocketAccountId,
    validateSchema,
} from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function sendCommunityMessage({
    io,
    socket,
    message,
}: SendCommunityMessageServerParams): Promise<
    SendCommunityMessageResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (!account.isInCommunity) {
        return generateError('NOT_IN_COMMUNITY');
    }

    // TODO: Message request accepted requirement

    // Remove unnecessary whitespace, dont allow 3 new lines in a row
    message = message.trim().replace(/\n\n\n/g, '');

    const newSchemaResult = validateSchema(
        new StringSchema({
            message: {
                minLength: 1,
                maxLength: 256,
            },
        }),
        { message }
    );

    if (newSchemaResult) {
        return newSchemaResult;
    }

    const newMessageData = await prismaClient.communityMessage.create({
        data: {
            ownerId: account.profileId,
            communityId: account.communityId,
            messageId: v4(),
            content: message,
        },
    });

    io.to(account.communityId).emit('newCommunityMessage', { newMessageData });

    // Delete older messages asynchronously
    prismaClient.communityMessage
        .count({
            where: {
                communityId: account.communityId,
            },
        })
        .then((number) => {
            if (number > 100) {
                prismaClient.communityMessage
                    .groupBy({
                        where: {
                            communityId: account.communityId,
                        },

                        by: ['creationDate'],
                    })
                    .then((arr) => {
                        const dateArr = [];

                        for (const dateIndex in arr) {
                            dateArr.push(arr[dateIndex].creationDate);
                        }

                        // Sort by creation date, get oldest
                        dateArr.sort((a, b) => a.getTime() - b.getTime());

                        prismaClient.communityMessage.deleteMany({
                            where: {
                                communityId: account.communityId,
                                creationDate: new Date(dateArr[0]),
                            },
                        });
                    });
            }
        });

    return {};
}

const sendCommunityMessageTemplate: EventTemplate = {
    func: sendCommunityMessage,
    template: ['message'],
    points: 5,
    schema: new StringSchema({
        message: {
            minLength: 1,
            maxLength: 256,
        },
    }),
};

export default sendCommunityMessageTemplate;
