// ******************** //
// Interfaces for all kinds of files.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { Server, Socket } from 'socket.io';

export interface SocketIOConnectionError extends Error {
    code: number;
}

export interface FronvoError {
    err: {
        msg: string;
        code: number;
        name: string;
        extras?: {
            for?: string;
            min?: number;
            max?: number;
        };
    };
}

export interface LoggedInSocket {
    accountId: string;
    socket: Socket;
}

export interface PerformanceReport {
    reportName: string;
    timestamp: Date;
}

export interface EventArguments {
    io: Server<ClientToServerEvents, ServerToClientEvents>;
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export interface EventTemplate {
    func: Function;
    template: string[];
    schema?: StringSchema;
}

export interface EventExportTemplate {
    [funcName: string]: EventTemplate;
}

export interface InterEventExportTemplate {
    [funcName: string]: Function;
}
