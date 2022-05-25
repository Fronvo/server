// ******************** //
// The disconnect dispatcher file which handles disconnections.
// ******************** //

import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import * as variables from 'variables/global';
import { Server, Socket } from 'socket.io';
import utilities from 'utilities/all';

export default function disconnectDispatch(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>,
    socket: Socket<ServerToClientEvents, ClientToServerEvents>,
    reason: string
): void {
    // Logout if logged in
    if (utilities.isSocketLoggedIn(socket)) {
        utilities.logoutSocket(io, socket);
    } else {
        // If not logged in, remove the unauthorised socket id from the ratelimits
        if (!variables.testMode) {
            variables.rateLimiterUnauthorised.clearRateLimit(
                socket.handshake.address,
                true
            );
        }
    }

    console.log('Socket ' + socket.id + ' has disconnected.');

    // Exit process when the test client disconnects
    if (variables.testMode) {
        process.exit();
    }
}
