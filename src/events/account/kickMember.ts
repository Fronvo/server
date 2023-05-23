// ******************** //
// The kickMember account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    KickMemberResult,
    KickMemberServerParams,
} from 'interfaces/account/kickMember';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getAccountSocketId,
    getSocketAccountId,
} from 'utilities/global';
import { loggedInSockets, prismaClient } from 'variables/global';

async function kickMember({
    io,
    socket,
    profileId,
}: KickMemberServerParams): Promise<KickMemberResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    // Must be in room
    if (!account.isInRoom) {
        return generateError('NOT_IN_ROOM');
    }

    const room = await prismaClient.room.findFirst({
        where: {
            roomId: account.roomId,
        },
    });

    // Must be the owner
    if (!(account.profileId == room.ownerId)) {
        return generateError('NOT_OWNER');
    }

    // Check if member with id is in this room
    if (!room.members.includes(profileId)) {
        return generateError('NOT_IN_THIS_ROOM');
    }

    // Kick him now

    // Remove from members list
    const newMembers = room.members;

    // Remove current member
    newMembers.splice(newMembers.indexOf(profileId), 1);

    await prismaClient.room.update({
        where: {
            roomId: room.roomId,
        },

        data: {
            members: newMembers,
        },
    });

    // Update the member's profile aswell
    await prismaClient.account.update({
        where: {
            profileId,
        },

        data: {
            roomId: '',
            isInRoom: false,
        },
    });

    // Notify all members (including banned member, update client)
    io.to(room.roomId).emit('memberLeft', {
        profileId,
    });

    // Remove socket from room room (if online)
    await loggedInSockets[getAccountSocketId(profileId)]?.socket.leave(
        room.roomId
    );

    return {};
}

const kickMemberTemplate: EventTemplate = {
    func: kickMember,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default kickMemberTemplate;
