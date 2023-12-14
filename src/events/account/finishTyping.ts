// ******************** //
// The finishTyping account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { roomIdSchema } from 'events/shared';
import {
    FinishTypingResult,
    FinishTypingServerParams,
} from 'interfaces/account/finishTyping';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function finishTyping({
    io,
    account,
    roomId,
}: FinishTypingServerParams): Promise<FinishTypingResult | FronvoError> {
    const room = await prismaClient.dm.findFirst({
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

    io.to(roomId).emit('typingEnded', {
        roomId,
        profileId: account.profileId,
    });

    return {};
}

const finishTypingTemplate: EventTemplate = {
    func: finishTyping,
    template: ['roomId'],
    schema: new StringSchema({
        ...roomIdSchema,
    }),
};

export default finishTypingTemplate;
