// ******************** //
// The regenerateServerInvite account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { serverIdSchema } from 'events/shared';
import {
    RegenerateServerInviteResult,
    RegenerateServerInviteServerParams,
} from 'interfaces/account/regenerateServerInvite';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function regenerateServerInvite({
    io,
    account,
    serverId,
}: RegenerateServerInviteServerParams): Promise<
    RegenerateServerInviteResult | FronvoError
> {
    const server = await prismaClient.server.findFirst({
        where: {
            serverId,
        },
    });

    if (!server) {
        return generateError('SERVER_404');
    }

    if (!server.members.includes(account.profileId)) {
        return generateError('NOT_IN_SERVER');
    }

    if (server.ownerId != account.profileId) {
        return generateError('NOT_OWNER');
    }

    const newInvite = v4().replace(/-/, '').substring(0, 8);

    try {
        await prismaClient.server.update({
            where: {
                serverId,
            },

            data: {
                invite: newInvite,
            },
        });

        io.to(serverId).emit('serverInviteRegenerated', {
            serverId,
            invite: newInvite,
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    return {};
}

const regenerateServerInviteTemplate: EventTemplate = {
    func: regenerateServerInvite,
    template: ['serverId'],
    schema: new StringSchema({
        ...serverIdSchema,
    }),
};

export default regenerateServerInviteTemplate;
