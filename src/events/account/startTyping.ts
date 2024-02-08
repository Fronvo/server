// ******************** //
// The startTyping account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Channel, Dm } from '@prisma/client';
import { roomIdSchema, serverIdSchemaOptional } from 'events/shared';
import {
    StartTypingResult,
    StartTypingServerParams,
} from 'interfaces/account/startTyping';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function startTyping({
    io,
    socket,
    account,
    serverId,
    roomId,
}: StartTypingServerParams): Promise<StartTypingResult | FronvoError> {
    let room: Dm | Channel;

    if (serverId) {
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

        room = await prismaClient.channel.findFirst({
            where: {
                channelId: roomId,
            },
        });
    } else {
        room = await prismaClient.dm.findFirst({
            where: {
                roomId,
            },
        });

        if (!room) {
            return generateError('ROOM_404');
        }

        if (!room.dmUsers.includes(account.profileId)) {
            return generateError('NOT_IN_ROOM');
        }
    }

    io.to(roomId).except(socket.id).emit('typingStarted', {
        roomId,
        profileId: account.profileId,
    });

    return {};
}

const startTypingTemplate: EventTemplate = {
    func: startTyping,
    template: ['serverId', 'roomId'],
    schema: new StringSchema({
        ...serverIdSchemaOptional,
        ...roomIdSchema,
    }),
};

export default startTypingTemplate;
