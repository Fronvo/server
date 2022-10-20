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
    replyId,
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

    // Remove unnecessary whitespace, dont allow 3 new lines in a row
    message = message.trim().replace(/\n\n\n/g, '');

    const newSchemaResult = validateSchema(
        new StringSchema({
            message: {
                minLength: 1,
                maxLength: 500,
            },
        }),
        { message }
    );

    if (newSchemaResult) {
        return newSchemaResult;
    }

    // Check if were allowed to chat in this community
    const community = await prismaClient.community.findFirst({
        where: {
            communityId: account.communityId,
        },

        select: {
            acceptedChatRequests: true,
        },
    });

    if (!community.acceptedChatRequests.includes(account.profileId)) {
        return generateError('NO_CHAT_PERMISSION');
    }

    const newMessageData = await prismaClient.communityMessage.create({
        data: {
            ownerId: account.profileId,
            communityId: account.communityId,
            messageId: v4(),
            content: message,
            isReply: Boolean(replyId),
            replyId: replyId || '',
        },
    });

    io.to(account.communityId).emit('newCommunityMessage', { newMessageData });

    // Delete older messages synchronously
    const totalMessages = await prismaClient.communityMessage.count({
        where: {
            communityId: account.communityId,
        },
    });

    if (totalMessages > 100) {
        const groupedMessages = await prismaClient.communityMessage.groupBy({
            where: {
                communityId: account.communityId,
            },

            by: ['creationDate'],
        });

        const dateArr = [];

        for (const dateIndex in groupedMessages) {
            dateArr.push(groupedMessages[dateIndex].creationDate);
        }

        // Sort by creation date, get oldest
        dateArr.sort((a, b) => a.getTime() - b.getTime());

        await prismaClient.communityMessage.deleteMany({
            where: {
                communityId: account.communityId,
                creationDate: new Date(dateArr[0]),
            },
        });
    }

    return {};
}

const sendCommunityMessageTemplate: EventTemplate = {
    func: sendCommunityMessage,
    template: ['message', 'replyId'],
    schema: new StringSchema({
        message: {
            minLength: 1,
            maxLength: 500,
        },

        replyId: {
            type: 'uuid',
            optional: true,
        },
    }),
};

export default sendCommunityMessageTemplate;
