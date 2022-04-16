// ******************** //
// The main event file which provides arguments to the rest of the events and manages access states.
// ******************** //

import dispatchers from 'events/dispatchers/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import * as variables from 'other/variables';
import { rateLimiter } from 'other/variables';
import { Server } from 'socket.io';

export default function entry(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>): void {
    io.on('connection', (socket): void => {
        console.log('Socket ' + socket.id + ' has connected.');

        socket.onAny((event: string, ...args: {[arg: string]: any}[]) => {
            dispatchers.eventDispatch(io, socket, event, ...args);
        });

        socket.on('disconnect', (reason): void => {
            dispatchers.disconnectDispatch(io, socket, reason);
        });
    });

    io.engine.on('connection_error', (err: Error) => {
        // @ts-ignore
        // Socket.IO adds the code property
        // TODO: Make a custom type
        console.log('Connection abnormally closed:  [' + err.code + ']' +  err.message);
    });

    // The following events are only called while using PM2 to be able to synchronise each server's variables
    // TODO: Seperate folder for inter-server events
    io.on('updateRateLimit', (socketIP, pointsToConsume) => {
        rateLimiter.consumePoints(socketIP, pointsToConsume).catch(() => {});
    });

    io.on('loginSocket', (socketId, accountId) => {
        variables.loggedInSockets[socketId] = {accountId};
    });

    io.on('logoutSocket', (socketId) => {
        delete variables.loggedInSockets[socketId];
    });
}
