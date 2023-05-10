// ******************** //
// The showBannedMembers account event file.
// ******************** //

import { Account } from '@prisma/client';
import {
    ShowBannedMembersResult,
    ShowBannedMembersServerParams,
} from 'interfaces/account/showBannedMembers';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function showBannedMembers({
    socket,
}: ShowBannedMembersServerParams): Promise<
    ShowBannedMembersResult | FronvoError
> {
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

    const bannedMembers: Partial<Account>[] = [];

    for (const memberIndex in room.bannedMembers) {
        const bannedMember = await prismaClient.account.findFirst({
            where: {
                profileId: room.bannedMembers[Number(memberIndex)].toString(),
            },

            select: {
                avatar: true,
                banner: true,
                bio: true,
                creationDate: true,
                followers: true,
                following: true,
                isPrivate: true,
                profileId: true,
                username: true,
                isAdmin: true,
            },
        });

        bannedMembers.push(bannedMember);
    }

    return { bannedMembers };
}

const showBannedMembersTemplate: EventTemplate = {
    func: showBannedMembers,
    template: [],
};

export default showBannedMembersTemplate;
