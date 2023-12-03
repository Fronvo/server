// ******************** //
// The createServer account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    CreateServerResult,
    CreateServerServerParams,
} from 'interfaces/account/createServer';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { roomNameSchema } from 'events/shared';
import { prismaClient } from 'variables/global';
import { generateError } from 'utilities/global';
import { v4 } from 'uuid';

async function createServer({
    io,
    socket,
    account,
    name,
}: CreateServerServerParams): Promise<CreateServerResult | FronvoError> {
    name = name.replace(/\n/g, '');

    // Limit to 5 rooms max
    let totalRooms: number;

    try {
        totalRooms = await prismaClient.server.count({
            where: {
                ownerId: account.profileId,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Free limit: < 5 rooms, PRO limit: < 20 rooms
    if (totalRooms >= (account.isPRO ? 20 : 5)) {
        return generateError('OVER_LIMIT');
    }

    const serverId = v4();

    try {
        await prismaClient.server.create({
            data: {
                serverId,
                ownerId: account.profileId,
                name,
                members: [account.profileId],
            },

            select: {
                serverId: true,
                ownerId: true,
                name: true,
                icon: true,
                description: true,
                creationDate: true,
                members: true,
                channels: true,
                roles: true,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    await socket.join(serverId);

    io.to(socket.id).emit('serverCreated', {
        serverId,
    });

    return {};
}

const createServerTemplate: EventTemplate = {
    func: createServer,
    template: ['name'],
    schema: new StringSchema({
        ...roomNameSchema,
    }),
};

export default createServerTemplate;
