// ******************** //
// The createRoom account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { roomIconSchema, roomNameSchema } from 'events/shared';
import {
    CreateRoomResult,
    CreateRoomServerParams,
} from 'interfaces/account/createRoom';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateChars } from 'test/utilities';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function createRoom({
    socket,
    name,
    icon,
}: CreateRoomServerParams): Promise<CreateRoomResult | FronvoError> {
    name = name.replace(/\n/g, '');

    const accountData = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (accountData.isInRoom) {
        return generateError('ALREADY_IN_ROOM');
    }

    const roomId = generateChars(12);

    const roomData = await prismaClient.room.create({
        data: {
            roomId,
            ownerId: accountData.profileId,
            name,
            icon,
            members: [accountData.profileId],
            bannedMembers: [],
        },
        select: {
            roomId: true,
            ownerId: true,
            name: true,
            creationDate: true,
            icon: true,
            members: true,
            bannedMembers: true,
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

    await socket.join(roomId);

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
