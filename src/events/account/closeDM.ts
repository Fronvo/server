// ******************** //
// The closeDM account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileId, roomIdSchema } from 'events/shared';
import { CloseDMResult, CloseDMServerParams } from 'interfaces/account/closeDM';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function closeDM({
    io,
    socket,
    roomId,
}: CloseDMServerParams): Promise<CloseDMResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    if (!room.isDM) {
        return generateError('ROOM_NOT_DM');
    }

    if (!room.dmUsers.includes(account.profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    if (room.dmHiddenFor?.includes(account.profileId)) {
        return generateError('DM_HIDDEN');
    }

    try {
        await prismaClient.room.update({
            where: {
                roomId,
            },

            data: {
                dmHiddenFor: {
                    push: account.profileId,
                },
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Notify both sockets about the new dm
    io.to(socket.id).emit('roomRemoved', {
        roomId,
    });

    // Don't make socket leave the DM room

    return {};
}

const closeDMTemplate: EventTemplate = {
    func: closeDM,
    template: ['roomId'],
    schema: new StringSchema({
        ...roomIdSchema,
    }),
};

export default closeDMTemplate;