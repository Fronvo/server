// ******************** //
// The kickMember account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema, roomIdSchema } from 'events/shared';
import {
    KickMemberResult,
    KickMemberServerParams,
} from 'interfaces/account/kickMember';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getAccountSocketId } from 'utilities/global';
import { loggedInSockets, prismaClient } from 'variables/global';

async function kickMember({
    io,
    account,
    roomId,
    profileId,
}: KickMemberServerParams): Promise<KickMemberResult | FronvoError> {
    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    if (!room.members.includes(profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    // Must be the owner
    if (account.profileId != room.ownerId) {
        return generateError('NOT_OWNER');
    }

    if (profileId == account.profileId) {
        return generateError('NOT_YOURSELF');
    }

    // Remove from members list
    const newMembers = room.members;

    // Remove current member
    newMembers.splice(newMembers.indexOf(profileId), 1);

    try {
        await prismaClient.room.update({
            where: {
                roomId,
            },

            data: {
                members: newMembers,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Notify all members (including banned member, update client)
    io.to(roomId).emit('memberLeft', {
        roomId,
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
    template: ['roomId', 'profileId'],
    schema: new StringSchema({
        ...roomIdSchema,
        ...profileIdSchema,
    }),
    fetchAccount: true,
};

export default kickMemberTemplate;
