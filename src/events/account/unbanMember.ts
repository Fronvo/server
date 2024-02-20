// ******************** //
// The unbanMember account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema, serverIdSchema } from 'events/shared';
import {
    UnbanMemberResult,
    UnbanMemberServerParams,
} from 'interfaces/account/unbanMember';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function unbanMember({
    io,
    socket,
    account,
    serverId,
    profileId,
}: UnbanMemberServerParams): Promise<UnbanMemberResult | FronvoError> {
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

    if (
        server.members.includes(profileId) ||
        !server.bannedMembers.includes(profileId)
    ) {
        return generateError('NOT_BANNED');
    }

    try {
        const newBans = server.bannedMembers;
        newBans.splice(newBans.indexOf(profileId), 1);

        await prismaClient.server.update({
            where: {
                serverId,
            },

            data: {
                bannedMembers: {
                    set: newBans,
                },
            },
        });

        io.to(socket.id).emit('memberUnbanned', {
            serverId,
            profileId,
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    return {};
}

const unbanMemberTemplate: EventTemplate = {
    func: unbanMember,
    template: ['serverId', 'profileId'],
    schema: new StringSchema({
        ...serverIdSchema,
        ...profileIdSchema,
    }),
};

export default unbanMemberTemplate;
