// ******************** //
// The banMember account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema, serverIdSchema } from 'events/shared';
import {
    BanMemberResult,
    BanMemberServerParams,
} from 'interfaces/account/banMember';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getAccountSocketId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function banMember({
    io,
    socket,
    account,
    serverId,
    profileId,
}: BanMemberServerParams): Promise<BanMemberResult | FronvoError> {
    const server = await prismaClient.server.findFirst({
        where: {
            serverId,
        },
    });

    if (account.profileId != server.ownerId) {
        return generateError('NOT_OWNER');
    }

    if (!server) {
        return generateError('SERVER_404');
    }

    if (!server.members.includes(account.profileId)) {
        return generateError('NOT_IN_SERVER');
    }

    const targetAccount = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!targetAccount) {
        return generateError('ACCOUNT_404');
    }

    // TODO: Moderators
    const targetSocket = io.sockets.sockets.get(getAccountSocketId(profileId));

    // Get target account socket if it's online
    targetSocket.join(account.profileId);

    const newMembers = server.members;
    newMembers.splice(newMembers.indexOf(profileId));

    try {
        await prismaClient.server.update({
            where: {
                serverId,
            },

            data: {
                members: {
                    set: newMembers,
                },
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    io.to(targetSocket.id).emit('serverDeleted', {
        serverId,
    });

    io.to(server.serverId).emit('memberLeft', {
        roomId: server.serverId,
        profileId: profileId,
    });

    // Update bans
    try {
        const bans = server.bannedMembers;
        bans.push(profileId);

        await prismaClient.server.update({
            where: {
                serverId,
            },

            data: {
                bannedMembers: {
                    set: bans,
                },
            },
        });

        // Only emit to owner
        // TODO: Moderators aswell
        io.to(socket.id).emit('memberBanned', {
            serverId,
            profileId,
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    return {};
}

const banMemberTemplate: EventTemplate = {
    func: banMember,
    template: ['serverId', 'profileId'],
    schema: new StringSchema({
        ...serverIdSchema,
        ...profileIdSchema,
    }),
};

export default banMemberTemplate;
