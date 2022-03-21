// ******************** //
// The logout account-only event file.
// ******************** //

import { EventArguments } from 'other/interfaces';
import { logoutSocket } from 'other/utilities';

export default function logout({ io, socket }: EventArguments): {} {
    logoutSocket(io, socket);
    return {};
}
