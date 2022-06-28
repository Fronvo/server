// ******************** //
// The logoutSocket inter-server event file.
// ******************** //

import { InterLogoutSocket } from 'interfaces/events/inter';
import * as variables from 'variables/global';

export default function logoutSocket({ socketId }: InterLogoutSocket): void {
    delete variables.loggedInSockets[socketId];
}
