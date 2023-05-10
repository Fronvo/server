// ******************** //
// The fetchRoomData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    FetchRoomDataResult,
    FetchRoomDataServerParams,
    FetchedFronvoRoom,
} from 'interfaces/account/fetchRoomData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { roomIdSchema } from '../shared';

async function fetchRoomData({
    roomId,
}: FetchRoomDataServerParams): Promise<FetchRoomDataResult | FronvoError> {
    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_NOT_FOUND');
    }

    const roomData: FetchedFronvoRoom = {
        roomId,
        ownerId: room.ownerId,
        name: room.name,
        creationDate: room.creationDate,
        icon: room.icon,
        members: room.members,
        totalMessages: await prismaClient.roomMessage.count({
            where: {
                roomId: room.roomId,
            },
        }),
    };

    return { roomData };
}

const fetchRoomDataTemplate: EventTemplate = {
    func: fetchRoomData,
    template: ['roomId'],
    schema: new StringSchema({
        ...roomIdSchema,
    }),
};

export default fetchRoomDataTemplate;
