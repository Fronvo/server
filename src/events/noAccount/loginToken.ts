// ******************** //
// The loginToken no-account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    LoginTokenResult,
    LoginTokenServerParams,
} from 'interfaces/noAccount/loginToken';
import { generateError, loginSocket } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function loginToken({
    io,
    socket,
    token,
}: LoginTokenServerParams): Promise<LoginTokenResult | FronvoError> {
    const tokenItem = await prismaClient.token.findFirst({
        where: {
            token,
        },
    });

    if (!tokenItem) {
        return generateError('INVALID_TOKEN');
    }

    const account = await prismaClient.account.findFirst({
        where: {
            profileId: tokenItem.profileId,
        },
    });

    loginSocket(io, socket, tokenItem.profileId);

    // Enter the room room, if joined one, for messages
    if (account.isInRoom) {
        await socket.join(account.roomId);
    }

    return {};
}

const loginTokenTemplate: EventTemplate = {
    func: loginToken,
    template: ['token'],
    schema: new StringSchema({
        token: {
            type: 'uuid',
        },
    }),
};

export default loginTokenTemplate;
