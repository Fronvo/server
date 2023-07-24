// ******************** //
// The loginToken no-account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    LoginTokenResult,
    LoginTokenServerParams,
} from 'interfaces/noAccount/loginToken';
import {
    generateError,
    getSocketAccountId,
    loginSocket,
} from 'utilities/global';
import { batchUpdatesDelay, prismaClient } from 'variables/global';

async function loginToken({
    io,
    socket,
    token,
    fcm,
}: LoginTokenServerParams): Promise<LoginTokenResult | FronvoError> {
    const tokenItem = await prismaClient.token.findFirst({
        where: {
            token,
        },
    });

    if (!tokenItem) {
        return generateError('INVALID', undefined, ['token']);
    }

    // Always provided on mobile, site we don't care
    loginSocket(io, socket, tokenItem.profileId, fcm);

    // Update account fcm key to provide notifications while socket.id is offline
    // Only on mobile
    if (fcm && getSocketAccountId(socket.id)) {
        setTimeout(async () => {
            await prismaClient.account.update({
                where: {
                    profileId: getSocketAccountId(socket.id),
                },

                data: {
                    fcm,
                },
            });
        }, batchUpdatesDelay);
    }

    return {};
}

const loginTokenTemplate: EventTemplate = {
    func: loginToken,
    template: ['token', 'fcm'],
    schema: new StringSchema({
        token: {
            type: 'uuid',
        },

        fcm: {
            minLength: 64,
            optional: true,
        },
    }),
};

export default loginTokenTemplate;
