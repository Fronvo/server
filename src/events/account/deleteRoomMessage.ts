// ******************** //
// The deleteRoomMessage account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    DeleteRoomMessageResult,
    DeleteRoomMessageServerParams,
} from 'interfaces/account/deleteRoomMessage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function deleteRoomMessage({
    io,
    socket,
    messageId,
}: DeleteRoomMessageServerParams): Promise<
    DeleteRoomMessageResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (!account.isInRoom) {
        return generateError('NOT_IN_ROOM');
    }

    const room = await prismaClient.room.findFirst({
        where: {
            roomId: account.roomId,
        },
    });

    const targetMessage = await prismaClient.roomMessage.findFirst({
        where: {
            messageId,
        },
    });

    // Must be the message author / room owner
    if (
        account.profileId != room.ownerId &&
        account.profileId != targetMessage.ownerId
    ) {
        return generateError('NOT_OWNER');
    }

    const deletedMessage = await prismaClient.roomMessage.deleteMany({
        where: {
            messageId,
        },
    });

    if (deletedMessage.count == 0) {
        return generateError('INVALID', undefined, ['message ID']);
    }

    io.to(room.roomId).emit('roomMessageDeleted', { messageId });

    return {};
}

const deleteRoomMessageTemplate: EventTemplate = {
    func: deleteRoomMessage,
    template: ['messageId'],
    schema: new StringSchema({
        messageId: {
            type: 'uuid',
        },
    }),
};

export default deleteRoomMessageTemplate;
