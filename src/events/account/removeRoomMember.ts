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

async function removeRoomMember({
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

    if (!room.members.includes(account.profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    if (!room.members.includes(profileId)) {
        return generateError('USER_NOT_IN_ROOM');
    }

    if (room.ownerId != account.profileId) {
        return generateError('NOT_OWNER');
    }

    // Finally, remove target from room
    try {
        // Update members
        const newMembers = room.members;
        newMembers.splice(newMembers.indexOf(profileId), 1);

        await prismaClient.room.update({
            where: {
                roomId,
            },

            data: {
                members: {
                    set: newMembers,
                },
            },
        });
    } catch (e) {}

    // Announce the new member before joining
    io.to(roomId).emit('memberLeft', {
        roomId,
        profileId,
    });

    // Put target account to the room's room
    io.sockets.sockets.get(getAccountSocketId(profileId))?.leave(roomId);

    io.sockets.sockets
        .get(getAccountSocketId(profileId))
        ?.emit('roomRemoved', { roomId });

    // Update seen states
    const newSeenStates = targetAccount.seenStates as {};

    if (newSeenStates) {
        if (roomId in newSeenStates) {
            delete newSeenStates[roomId];

            await prismaClient.account.update({
                where: {
                    profileId,
                },

                data: {
                    seenStates: newSeenStates,
                },
            });
        }
    }

    return {};
}

const removeRoomMemberTemplate: EventTemplate = {
    func: removeRoomMember,
    template: ['profileId', 'roomId'],
    schema: new StringSchema({
        ...profileIdSchema,
        ...roomIdSchema,
    }),
};

export default removeRoomMemberTemplate;
