// ******************** //
// The connect dispatcher file which handles socket connections.
// ******************** //

import dispatchers from 'events/dispatchers/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { Server, Socket } from 'socket.io';

export default function connectDispatch(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>,
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
): void {
    console.log('Socket ' + socket.id + ' has connected.');

    socket.onAny((event: string, ...args: { [arg: string]: any }[]) => {
        dispatchers.eventDispatch(io, socket, event, ...args);
    });

    socket.on('disconnect', (reason): void => {
        dispatchers.disconnectDispatch(io, socket, reason);
    });
}
