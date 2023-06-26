// ******************** //
// The addRoomMember account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema, roomIdSchema } from 'events/shared';
import {
    AddRoomMemberResult,
    AddRoomMemberServerParams,
} from 'interfaces/account/addRoomMember';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getAccountSocketId,
    getSocketAccountId,
} from 'utilities/global';
import { prismaClient } from 'variables/global';

async function addRoomMember({
    io,
    socket,
    roomId,
    profileId,
}: AddRoomMemberServerParams): Promise<AddRoomMemberResult | FronvoError> {
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

    if (room.isDM) {
        return generateError('ROOM_NOT_DM');
    }

    if (account.profileId == profileId) {
        return generateError('NOT_YOURSELF');
    }

    const targetAccount = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!targetAccount) {
        return generateError('ACCOUNT_404');
    }

    if (!targetAccount.friends.includes(account.profileId)) {
        return generateError('NOT_FRIEND');
    }

    if (!room.members.includes(account.profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    if (room.members.includes(profileId)) {
        return generateError('USER_IN_ROOM');
    }

    // Room members <= 10
    if (room.members.length > 9) {
        return generateError('OVER_LIMIT');
    }

    // Finally, add target to room
    try {
        await prismaClient.room.update({
            where: {
                roomId,
            },

            data: {
                members: {
                    push: profileId,
                },
            },
        });
    } catch (e) {}

    // Announce the new member before joining
    io.to(roomId).emit('memberJoined', {
        roomId,
        profileId,
    });

    // Put target account to the room's room
    io.sockets.sockets.get(getAccountSocketId(profileId))?.join(roomId);

    io.sockets.sockets.get(getAccountSocketId(profileId))?.emit('roomAdded', {
        roomId,
    });

    return {};
}

const addRoomMemberTemplate: EventTemplate = {
    func: addRoomMember,
    template: ['profileId', 'roomId'],
    schema: new StringSchema({
        ...profileIdSchema,
        ...roomIdSchema,
    }),
};

export default addRoomMemberTemplate;
