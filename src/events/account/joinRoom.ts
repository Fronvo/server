// ******************** //
// The joinRoom account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Room } from '@prisma/client';
import { roomIdSchema } from 'events/shared';
import {
    JoinRoomResult,
    JoinRoomServerParams,
} from 'interfaces/account/joinRoom';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function joinRoom({
    io,
    socket,
    roomId,
}: JoinRoomServerParams): Promise<JoinRoomResult | FronvoError> {
    const accountData = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (accountData.isInRoom) {
        return generateError('ALREADY_IN_ROOM');
    }

    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_NOT_FOUND');
    }

    // Finally, join the room
    await prismaClient.room.update({
        where: {
            roomId,
        },

        data: {
            members: [...room.members, accountData.profileId],
        },
    });

    await prismaClient.account.update({
        where: {
            profileId: accountData.profileId,
        },

        data: {
            isInRoom: true,
            roomId,
        },
    });

    const roomData: Partial<Room> = {
        roomId,
        ownerId: room.ownerId,
        name: room.name,
        creationDate: room.creationDate,
        icon: room.icon,
        members: room.members,
    };

    // Add socket to room room
    await socket.join(roomId);

    io.to(roomId).emit('memberJoined', {
        profileId: accountData.profileId,
    });

    return { roomData };
}

const joinRoomTemplate: EventTemplate = {
    func: joinRoom,
    template: ['roomId'],
    schema: new StringSchema({
        ...roomIdSchema,
    }),
};

export default joinRoomTemplate;
