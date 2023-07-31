// ******************** //
// The startTyping account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { roomIdSchema } from 'events/shared';
import {
    StartTypingResult,
    StartTypingServerParams,
} from 'interfaces/account/startTyping';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function startTyping({
    io,
    account,
    roomId,
}: StartTypingServerParams): Promise<StartTypingResult | FronvoError> {
    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    if (
        !room.members.includes(account.profileId) &&
        !room.dmUsers.includes(account.profileId)
    ) {
        return generateError('NOT_IN_ROOM');
    }

    io.to(roomId).emit('typingStarted', {
        roomId,
        profileId: account.profileId,
    });

    return {};
}

const startTypingTemplate: EventTemplate = {
    func: startTyping,
    template: ['roomId'],
    schema: new StringSchema({
        ...roomIdSchema,
    }),
    fetchAccount: true,
};

export default startTypingTemplate;
