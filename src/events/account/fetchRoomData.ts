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
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { roomIdSchema } from '../shared';

async function fetchRoomData({
    socket,
    roomId,
}: FetchRoomDataServerParams): Promise<FetchRoomDataResult | FronvoError> {
    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (
        !room.members.includes(account.profileId) &&
        !room.dmUsers.includes(account.profileId)
    ) {
        return generateError('NOT_IN_ROOM');
    }

    const totalMessages = await prismaClient.roomMessage.count({
        where: {
            roomId,
        },
    });

    const roomData: FetchedFronvoRoom = {
        roomId,
        ownerId: room.ownerId,
        name: room.name,
        creationDate: room.creationDate,
        icon: room.icon,
        members: room.members,
        totalMessages,
        lastMessage: room.lastMessage,
        lastMessageAt: room.lastMessageAt,
        lastMessageFrom: room.lastMessageFrom,
        dmUsers: room.dmUsers,
        isDM: room.isDM,
        unreadCount: totalMessages - account.seenStates[roomId] || 0,
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
