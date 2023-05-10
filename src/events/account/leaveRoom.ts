// ******************** //
// The leaveRoom account-only event file.
// ******************** //

import {
    LeaveRoomParams,
    LeaveRoomServerParams,
} from 'interfaces/account/leaveRoom';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function leaveRoom({
    io,
    socket,
}: LeaveRoomServerParams): Promise<LeaveRoomParams | FronvoError> {
    const accountData = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (!accountData.isInRoom) {
        return generateError('NOT_IN_ROOM');
    }

    const room = await prismaClient.room.findFirst({
        where: {
            roomId: accountData.roomId,
        },
    });

    // Finally, leave / delete the room
    if (accountData.profileId == room.ownerId) {
        // First of all, remove all references to this room from the members
        await prismaClient.account.updateMany({
            where: {
                roomId: accountData.roomId,
            },

            data: {
                roomId: '',
                isInRoom: false,
            },
        });

        // Then, delete the room
        await prismaClient.room.delete({
            where: {
                roomId: accountData.roomId,
            },
        });

        // Finally, remove all messages
        await prismaClient.roomMessage.deleteMany({
            where: {
                roomId: accountData.roomId,
            },
        });

        io.to(room.roomId).emit('roomDeleted');

        // Clear room
        io.socketsLeave(room.roomId);
    } else {
        // First, remove references to this room from the member's account
        await prismaClient.account.update({
            where: {
                profileId: accountData.profileId,
            },

            data: {
                roomId: '',
                isInRoom: false,
            },
        });

        // Then, update the member from the room's members array

        // Set in-place
        const newMembers = room.members;

        // Remove current member
        newMembers.splice(newMembers.indexOf(accountData.profileId), 1);

        await prismaClient.room.update({
            where: {
                roomId: accountData.roomId,
            },

            data: {
                members: newMembers,
            },
        });

        // Remove socket from room room
        await socket.leave(room.roomId);

        // Member left, update members
        io.to(room.roomId).emit('memberLeft', {
            profileId: accountData.profileId,
        });
    }

    return {};
}

const leaveroomTemplate: EventTemplate = {
    func: leaveRoom,
    template: [],
};

export default leaveroomTemplate;
