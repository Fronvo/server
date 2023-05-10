// ******************** //
// The sendRoomMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    SendRoomMessageResult,
    SendRoomMessageServerParams,
} from 'interfaces/account/sendRoomMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getSocketAccountId,
    validateSchema,
} from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function sendRoomMessage({
    io,
    socket,
    message,
    replyId,
}: SendRoomMessageServerParams): Promise<SendRoomMessageResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        select: {
            avatar: true,
            banner: true,
            bio: true,
            creationDate: true,
            followers: true,
            following: true,
            isPrivate: true,
            profileId: true,
            username: true,
            isAdmin: true,
            isInRoom: true,
            roomId: true,
        },
    });

    if (!account.isInRoom) {
        return generateError('NOT_IN_ROOM');
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

    let replyContent = '';

    if (replyId) {
        const replyMessage = await prismaClient.roomMessage.findFirst({
            where: {
                messageId: replyId,
            },

            select: {
                content: true,
            },
        });

        if (!replyMessage) {
            return generateError('INVALID_MESSAGE');
        }

        replyContent = replyMessage.content;
    }

    const newMessageData = await prismaClient.roomMessage.create({
        data: {
            ownerId: account.profileId,
            roomId: account.roomId,
            messageId: v4(),
            content: message,
            isReply: Boolean(replyId),
            replyContent,
        },

        select: {
            ownerId: true,
            roomId: true,
            content: true,
            creationDate: true,
            isReply: true,
            messageId: true,
            replyContent: true,
        },
    });

    io.to(account.roomId).emit('newRoomMessage', {
        newMessageData: {
            message: newMessageData,
            profileData: account,
        },
    });

    return {};
}

const sendRoomMessageTemplate: EventTemplate = {
    func: sendRoomMessage,
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

export default sendRoomMessageTemplate;
