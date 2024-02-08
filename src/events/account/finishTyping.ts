// ******************** //
// The finishTyping account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { Channel, Dm } from '@prisma/client';
import { roomIdSchema, serverIdSchemaOptional } from 'events/shared';
import {
    FinishTypingResult,
    FinishTypingServerParams,
} from 'interfaces/account/finishTyping';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function finishTyping({
    io,
    socket,
    account,
    serverId,
    roomId,
}: FinishTypingServerParams): Promise<FinishTypingResult | FronvoError> {
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

    io.to(roomId).except(socket.id).emit('typingEnded', {
        roomId,
        profileId: account.profileId,
    });

    return {};
}

const finishTypingTemplate: EventTemplate = {
    func: finishTyping,
    template: ['serverId', 'roomId'],
    schema: new StringSchema({
        ...serverIdSchemaOptional,
        ...roomIdSchema,
    }),
};

export default finishTypingTemplate;
