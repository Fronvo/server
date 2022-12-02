// ******************** //
// The rejectJoinRequest account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    RejectJoinRequestResult,
    RejectJoinRequestServerParams,
} from 'interfaces/account/rejectJoinRequest';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function rejectJoinRequest({
    socket,
    email,
}: RejectJoinRequestServerParams): Promise<
    RejectJoinRequestResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    const isAdmin = account.isAdmin || account.profileId == 'fronvo';

    if (!isAdmin) {
        return generateError('NOT_ADMIN');
    }

    const joinRequests = await prismaClient.joinRequests.findMany({});

    for (const request in joinRequests) {
        const target = joinRequests[request];

        if (target.email == email) {
            await prismaClient.joinRequests.delete({
                where: {
                    email,
                },
            });

            return {};
        }
    }

    return generateError('REQUEST_DOESNT_EXIST');
}

const rejectJoinRequestTemplate: EventTemplate = {
    func: rejectJoinRequest,
    template: ['email'],
    schema: new StringSchema({
        email: {
            minLength: 8,
            maxLength: 120,
            type: 'email',
        },
    }),
};

export default rejectJoinRequestTemplate;
