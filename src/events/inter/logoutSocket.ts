// ******************** //
// The logoutSocket inter-server event file.
// ******************** //

import { InterLogoutSocket } from 'interfaces/events/inter';
import * as variables from 'other/variables';

export default function logoutSocket({ socketId }: InterLogoutSocket): void {
    delete variables.loggedInSockets[socketId];
}
