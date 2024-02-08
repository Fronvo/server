// ******************** //
// The leaveServer account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Channel } from '@prisma/client';
import { serverIdSchema } from 'events/shared';
import {
    LeaveServerResult,
    LeaveServerServerParams,
} from 'interfaces/account/leaveServer';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function leaveServer({
    io,
    socket,
    account,
    serverId,
}: LeaveServerServerParams): Promise<LeaveServerResult | FronvoError> {
    const server = await prismaClient.server.findFirst({
        where: {
            serverId,
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

    if (!server.members.includes(account.profileId)) {
        return generateError('NOT_IN_SERVER');
    }

    if (server.ownerId == account.profileId) {
        return generateError('UNKNOWN');
    }

    // Leave all server channels
    for (const channelIndex in server.channels) {
        // @ts-ignore
        const channel = server.channels[channelIndex] as Channel;

        socket.leave(channel.channelId);
    }

    socket.leave(server.serverId);

    const newMembers = server.members;
    newMembers.splice(newMembers.indexOf(account.profileId));

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

    io.to(socket.id).emit('serverDeleted', {
        serverId,
    });

    io.to(server.serverId).emit('memberLeft', {
        roomId: server.serverId,
        profileId: account.profileId,
    });

    return {};
}

const leaveServerTemplate: EventTemplate = {
    func: leaveServer,
    template: ['serverId'],
    schema: new StringSchema({
        ...serverIdSchema,
    }),
};

export default leaveServerTemplate;
