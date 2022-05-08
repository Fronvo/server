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
        // TODO: connectDispatch file, add to rateLimits from here for unauthorised users
        console.log('Socket ' + socket.id + ' has connected.');

        socket.onAny((event: string, ...args: { [arg: string]: any }[]) => {
            dispatchers.eventDispatch(io, socket, event, ...args);
        });

        socket.on('disconnect', (reason): void => {
            dispatchers.disconnectDispatch(io, socket, reason);
        });
    });

    io.engine.on('connection_error', (err: SocketIOConnectionError) => {
        console.log(
            'Connection abnormally closed:  [' + err.code + ']' + err.message
        );
    });

    dispatchers.interDispatch(io);
}
