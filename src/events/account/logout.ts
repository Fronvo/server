// ******************** //
// The logout account-only event file.
// ******************** //

import { LogoutResult, LogoutServerParams } from 'interfaces/account/logout';
import { EventTemplate } from 'interfaces/all';
import { getSocketAccountId, logoutSocket } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function logout({
    io,
    socket,
}: LogoutServerParams): Promise<LogoutResult> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (account.isInCommunity) {
        await socket.leave(account.communityId);
    }

    logoutSocket(io, socket);

    return {};
}

const logoutTemplate: EventTemplate = {
    func: logout,
    template: [],
    points: 5,
};

export default logoutTemplate;
