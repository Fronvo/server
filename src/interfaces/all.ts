// ******************** //
// Interfaces for all kinds of files.
// ******************** //

import { Server, Socket } from 'socket.io';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { InterServerEvents } from 'interfaces/events/inter';

export interface FronvoError {
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
