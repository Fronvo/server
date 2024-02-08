// ******************** //
// The renameChannel account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { channelIdSchema, serverIdSchema } from 'events/shared';
import {
    RenameChannelResult,
    RenameChannelServerParams,
} from 'interfaces/account/renameChannel';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function renameChannel({
    io,
    account,
    serverId,
    channelId,
    name,
}: RenameChannelServerParams): Promise<RenameChannelResult | FronvoError> {
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

    const channel = await prismaClient.channel.findFirst({
        where: {
            channelId,
        },
    });

    if (!channel) {
        return generateError('ROOM_404');
    }

    // Not same name
    if (name == channel.name) return {};

    await prismaClient.channel.update({
        where: {
            channelId,
        },

        data: {
            name,
        },
    });

    io.to(serverId).emit('channelRenamed', {
        serverId,
        channelId,
        name,
    });

    return {};
}

const renameChannelTemplate: EventTemplate = {
    func: renameChannel,
    template: ['serverId', 'channelId', 'name'],
    schema: new StringSchema({
        ...serverIdSchema,
        ...channelIdSchema,

        name: {
            minLength: 1,
            maxLength: 20,
        },
    }),
};

export default renameChannelTemplate;
