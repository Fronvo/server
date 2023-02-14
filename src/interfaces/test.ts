// ******************** //
// Interfaces for all test event files.
// ******************** //

import { Socket } from 'socket.io';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';

export interface TestArguments {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    done: Mocha.Done;
}

export type SharedTestVariablesType =
    | 'email'
    | 'password'
    | 'token'
    | 'profileId'
    | 'secondaryProfileToken'
    | 'secondaryProfileId'
    | 'sharedPostId'
    | 'createdCommunityId'
    | 'createdCommunityName'
    | 'sharedMessageId';

export interface TestErrorCallback {
    (err?: string);
}
