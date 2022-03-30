// ******************** //
// The logout account-only event file.
// ******************** //

import { LogoutResult, LogoutServerParams } from 'interfaces/account/logout';
import { EventTemplate } from 'interfaces/all';
import { logoutSocket } from 'utilities/global';

function logout({ io, socket }: LogoutServerParams): LogoutResult {
    logoutSocket(io, socket);
    return {};
}

const logoutTemplate: EventTemplate = {
    func: logout,
    template: [],
    points: 5
};

export default logoutTemplate;
