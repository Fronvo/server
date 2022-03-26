// ******************** //
// Interfaces for all test event files.
// ******************** //

import { ClientToServerEvents, ServerToClientEvents } from 'interfaces/all';
import { Socket } from 'socket.io';

export interface TestArguments {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    done: Mocha.Done;
    assert: Chai.Assert;
    shared: SharedVariables;
}

export interface SharedVariables {
    email: string;
    password: string;
    token: string;
    profileId: string;
}
