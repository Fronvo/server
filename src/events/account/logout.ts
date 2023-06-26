// ******************** //
// The logout account-only event file.
// ******************** //

import { LogoutResult, LogoutServerParams } from 'interfaces/account/logout';
import { EventTemplate } from 'interfaces/all';
import { logoutSocket } from 'utilities/global';

async function logout({
    io,
    socket,
}: LogoutServerParams): Promise<LogoutResult> {
    logoutSocket(io, socket);

    return {};
}

const logoutTemplate: EventTemplate = {
    func: logout,
    template: [],
};

export default logoutTemplate;
