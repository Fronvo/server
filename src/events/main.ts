// ******************** //
// The main event file which provides arguments to the rest of the events and manages access states.
// ******************** //

import dispatchers from 'events/dispatchers/all';
import { SocketIOConnectionError } from 'interfaces/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { Server } from 'socket.io';

export default function entry(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>
): void {
    io.on('connection', (socket): void => {
        dispatchers.connectDispatch(io, socket);
    });

    io.engine.on('connection_error', (err: SocketIOConnectionError) => {
        dispatchers.connectionErrorDispatch(err);
    });

    // Register inter-server events
    dispatchers.interDispatch(io);
}
