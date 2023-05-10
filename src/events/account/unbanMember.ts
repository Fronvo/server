// ******************** //
// The unbanMember account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    UnbanMemberResult,
    UnbanMemberServerParams,
} from 'interfaces/account/unbanMember';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function unbanMember({
    socket,
    profileId,
}: UnbanMemberServerParams): Promise<UnbanMemberResult | FronvoError> {
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
        return generateError('NOT_ROOM_OWNER');
    }

    // Check if member with id is banned
    if (!room.bannedMembers.includes(profileId)) {
        return generateError('MEMBER_NOT_BANNED');
    }

    // Remove from banned members list
    const newBannedMembers = room.bannedMembers;

    newBannedMembers.splice(newBannedMembers.indexOf(profileId), 1);

    await prismaClient.room.update({
        where: {
            roomId: room.roomId,
        },

        data: {
            bannedMembers: newBannedMembers,
        },
    });

    return {};
}

const unbanMemberTemplate: EventTemplate = {
    func: unbanMember,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default unbanMemberTemplate;
