// ******************** //
// The createChannel account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    CreateChannelResult,
    CreateChannelServerParams,
} from 'interfaces/account/createChannel';
import { serverIdSchema } from 'events/shared';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { v4 } from 'uuid';

async function createChannel({
    io,
    socket,
    account,
    serverId,
    name,
}: CreateChannelServerParams): Promise<CreateChannelResult | FronvoError> {
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

    if (account.profileId != server.ownerId) {
        return generateError('NOT_OWNER');
    }

    const channelId = v4();

    await prismaClient.channel.create({
        data: {
            channelId,
            name,
        },
    });

    await prismaClient.server.update({
        where: {
            serverId,
        },

        data: {
            channels: {
                push: channelId,
            },
        },
    });

    // Make all server sockets join the channel room
    socket.in(serverId).socketsJoin(channelId);

    io.to(serverId).emit('channelCreated', {
        serverId,
        channelId,
        name,
    });

    return {};
}

const createChannelTemplate: EventTemplate = {
    func: createChannel,
    template: ['serverId', 'name'],
    schema: new StringSchema({
        ...serverIdSchema,

        name: {
            minLength: 1,
            maxLength: 20,
        },
    }),
};

export default createChannelTemplate;
