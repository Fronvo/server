// ******************** //
// The createRoom account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Room } from '@prisma/client';
import { roomIconSchema, roomNameSchema } from 'events/shared';
import {
    CreateRoomResult,
    CreateRoomServerParams,
} from 'interfaces/account/createRoom';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function createRoom({
    io,
    socket,
    name,
    icon,
}: CreateRoomServerParams): Promise<CreateRoomResult | FronvoError> {
    name = name.replace(/\n/g, '');

    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    // Limit to 20 rooms max
    let totalRooms: number;

    try {
        totalRooms = await prismaClient.room.count({
            where: {
                ownerId: account.profileId,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    if (totalRooms > 20) {
        return generateError('OVER_LIMIT');
    }

    const roomId = v4();

    let roomData: Partial<Room>;

    try {
        roomData = await prismaClient.room.create({
            data: {
                roomId,
                ownerId: account.profileId,
                name,
                icon,
                members: [account.profileId],
            },

            select: {
                roomId: true,
                ownerId: true,
                name: true,
                creationDate: true,
                icon: true,
                members: true,
                lastMessageAt: true,
                dmUsers: true,
                isDM: true,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    await socket.join(roomId);

    io.to(socket.id).emit('roomCreated', {
        roomId,
    });

    return { roomData };
}

const createRoomTemplate: EventTemplate = {
    func: createRoom,
    template: ['name', 'icon'],
    schema: new StringSchema({
        ...roomNameSchema,
        ...roomIconSchema,
    }),
};

export default createRoomTemplate;
