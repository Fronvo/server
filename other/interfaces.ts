// ******************** //
// TypeScript interfaces.
// ******************** //

import { Server, Socket } from 'socket.io';

export interface ClientToServerEvents {
    // Dont add types here, we use a dynamic event system
    // Leave here for comfort
}

export interface ServerToClientEvents {
    // TODO: Start adding events which are called on their own here
    // with io.emit(...), not callback-able
}

export interface InterServerEvents {
    loginSocket: (socketId: string, accountId: string) => void;
    logoutSocket: (socketId: string) => void;
}

export interface Error {
    err: {
        msg: string,
        code: number,
        extras?: {
            for?: string;
            min?: number;
            max?: number;
        }
    }
}

export interface LoggedInSocket {
    accountId: string;
}

export interface PerformanceReport {
    perfName: string;
    timestamp: Date;
}

export interface RequiredStartupFile {
    path: string;
    template?: {};
}

export interface EventArguments {
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export interface Account {
    username: string;
    email: string;
    password: string;
    creationDate: Date;
}

export interface Token {
    [accountId: string]: string;
}
