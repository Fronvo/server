// ******************** //
// The logout account-only event file.
// ******************** //

import { LogoutResult, LogoutServerParams } from 'interfaces/account/logout';
import { logoutSocket } from 'other/utilities';

export default ({ io, socket }: LogoutServerParams): LogoutResult => {
    logoutSocket(io, socket);
    return {};
}
