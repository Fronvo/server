// ******************** //
// Interfaces for all test event files.
// ******************** //

import { Socket } from 'socket.io';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';

export interface TestArguments {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    done: Mocha.Done;
    shared: SharedVariables;
}

export interface SharedVariables {
    email: string;
    password: string;
    token: string;
    profileId: string;
}

export interface TestErrorCallback {
    (err?: string);
}
