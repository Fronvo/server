// ******************** //
// The toggleServerInvites account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { serverIdSchema } from 'events/shared';
import {
    ToggleServerInvitesResult,
    ToggleServerInvitesServerParams,
} from 'interfaces/account/toggleServerInvites';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function toggleServerInvites({
    io,
    serverId,
    account,
}: ToggleServerInvitesServerParams): Promise<
    ToggleServerInvitesResult | FronvoError
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

    try {
        const server2 = await prismaClient.server.update({
            where: {
                serverId,
            },

            data: {
                invitesDisabled: !server.invitesDisabled,
            },
        });

        // Make sure its applied server side too
        io.to(server.serverId).emit('serverInvitesToggled', {
            serverId: server.serverId,
            enabled: !server2.invitesDisabled,
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    return {};
}

const toggleServerInvitesTemplate: EventTemplate = {
    func: toggleServerInvites,
    template: ['serverId'],
    schema: new StringSchema({
        ...serverIdSchema,
    }),
};

export default toggleServerInvitesTemplate;
