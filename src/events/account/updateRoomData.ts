// ******************** //
// The updateRoomData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Room } from '@prisma/client';
import {
    roomIconSchema,
    roomIdSchema,
    roomNameOptionalSchema,
} from 'events/shared';
import {
    UpdateRoomDataResult,
    UpdateRoomDataServerParams,
} from 'interfaces/account/updateRoomData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function updateRoomData({
    io,
    account,
    roomId,
    name,
    icon,
}: UpdateRoomDataServerParams): Promise<UpdateRoomDataResult | FronvoError> {
    // Name validation not needed here, see schema below
    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    // Check if we are in the room, not necessary to be the owner
    if (!room.members.includes(account.profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    // Ensure name is not empty
    if (!name) {
        name = room.name;
    }

    // Not really Partial but roll with it
    let roomData: Partial<Room>;

    try {
        roomData = await prismaClient.room.update({
            where: {
                roomId,
            },

            data: {
                name,
                icon,
            },

            select: {
                name: true,
                icon: true,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    io.to(roomId).emit('roomDataUpdated', {
        roomId,
        name: roomData.name,
        icon: roomData.icon,
    });

    return {};
}

const updateRoomDataTemplate: EventTemplate = {
    func: updateRoomData,
    template: ['roomId', 'name', 'icon'],
    schema: new StringSchema({
        ...roomIdSchema,
        ...roomNameOptionalSchema,
        ...roomIconSchema,
    }),
};

export default updateRoomDataTemplate;
