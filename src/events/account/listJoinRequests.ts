// ******************** //
// The listJoinRequests account event file.
// ******************** //

import {
    ListJoinRequestsResult,
    ListJoinRequestsServerParams,
} from 'interfaces/account/listJoinRequests';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function listJoinRequests({
    socket,
}: ListJoinRequestsServerParams): Promise<
    ListJoinRequestsResult | FronvoError
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

    return {
        joinRequests: await prismaClient.joinRequests.findMany({
            select: {
                email: true,
            },
        }),
    };
}

const listJoinRequestsTemplate: EventTemplate = {
    func: listJoinRequests,
    template: [],
};

export default listJoinRequestsTemplate;
