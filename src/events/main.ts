// ******************** //
// The main event file which provides arguments to the rest of the events and manages access states.
// ******************** //

import dispatchers from 'events/dispatchers/all';
import { SocketIOConnectionError } from 'interfaces/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { Server } from 'socket.io';

export default function entry(
    io: Server<ClientToServerEvents, ServerToClientEvents>
): void {
    io.on('connection', (socket): void => {
        dispatchers.connectDispatch(io, socket);
    });

    io.engine.on('connection_error', (err: SocketIOConnectionError) => {
        dispatchers.connectionErrorDispatch(err);
    });
}
