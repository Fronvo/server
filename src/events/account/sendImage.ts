// ******************** //
// The sendRoomMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Message } from '@prisma/client';
import {
    SendImageResult,
    SendImageServerParams,
} from 'interfaces/account/sendImage';

import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    decryptAES,
    generateError,
    sendMulticastFCM,
    updateRoomSeen,
} from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function sendImage({
    io,
    account,
    roomId,
    attachment,
}: SendImageServerParams): Promise<SendImageResult | FronvoError> {
    const room = await prismaClient.dm.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    // Must be in the room
    if (!room.dmUsers.includes(account.profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    let newMessageData: Partial<Message>;

    try {
        newMessageData = await prismaClient.message.create({
            data: {
                ownerId: account.profileId,
                roomId,
                messageId: v4(),
                isImage: true,
                attachment,
            },

            select: {
                ownerId: true,
                roomId: true,
                content: true,
                creationDate: true,
                messageId: true,
                isReply: true,
                replyContent: true,
                isImage: true,
                attachment: true,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    io.to(roomId).emit('newMessage', {
        roomId,
        newMessageData: {
            message: newMessageData,
            profileData: account,
        },
    });

    try {
        // Update ordering of message lists
        await prismaClient.dm.update({
            where: {
                roomId,
            },

            data: {
                lastMessageAt: new Date(),
            },
        });

        sendMulticastFCM(
            room.dmUsers as string[],
            `@${account.profileId}`,
            `${account.username} sent an image`,
            account.profileId,
            true
        );
    } catch (e) {
        return generateError('UNKNOWN');
    }

    updateRoomSeen(io, room.roomId);

    return {};
}

const sendImageTemplate: EventTemplate = {
    func: sendImage,
    template: ['roomId', 'attachment'],
    schema: new StringSchema({
        roomId: {
            type: 'uuid',
        },

        attachment: {
            // Ensure https
            regex: /https:\/\/ik.imagekit.io\/fronvo(2)?\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/,
        },
    }),
};

export default sendImageTemplate;
