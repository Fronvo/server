// ******************** //
// The joinServer account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { serverInviteSchema } from 'events/shared';
import {
    JoinServerResult,
    JoinServerServerParams,
} from 'interfaces/account/joinServer';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function joinServer({
    io,
    socket,
    account,
    invite,
}: JoinServerServerParams): Promise<JoinServerResult | FronvoError> {
    const server = await prismaClient.server.findFirst({
        where: {
            invite,
        },

        select: {
            serverId: true,
            ownerId: true,
            name: true,
            icon: true,
            invite: true,
            invitesDisabled: true,
            creationDate: true,
            members: true,
            channels: true,
            roles: true,
        },
    });

    if (!server) {
        return generateError('SERVER_404');
    }

    if (server.members.includes(account.profileId)) {
        return generateError('ALREADY_IN_SERVER');
    }

    if (server.invitesDisabled) {
        return generateError('SERVER_INVITES_DISABLED');
    }

    // Add to server
    const server2 = await prismaClient.server.update({
        where: {
            serverId: server.serverId,
        },

        data: {
            members: {
                push: account.profileId,
            },
        },
    });

    // Channel info on the fly
    if (server2.channels.length != 0) {
        server2.channels = (await prismaClient.channel.findMany({
            where: {
                channelId: {
                    in: server2.channels as string[],
                },
            },
        })) as [];
    }

    io.to(server.serverId).emit('memberJoined', {
        roomId: server.serverId,
        profileId: account.profileId,
    });

    io.to(socket.id).emit('serverJoined', {
        server: server2,
    });

    // Add to server channel
    socket.join(server.serverId);

    return {};
}

const joinServerTemplate: EventTemplate = {
    func: joinServer,
    template: ['invite'],
    schema: new StringSchema({
        ...serverInviteSchema,
    }),
};

export default joinServerTemplate;
