// ******************** //
// Interfaces for all kinds of files.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { AccountData, LogData, ReportData, TokenData } from '@prisma/client';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
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
}

export interface PerformanceReport {
    reportName: string;
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

export interface EventTemplate {
    func: Function;
    template: string[];
    points: number;
    schema?: StringSchema;
}

export interface EventExportTemplate {
    [funcName: string]: EventTemplate;
}

export interface InterEventExportTemplate {
    [funcName: string]: Function;
}

export interface FronvoAccount {
    id: string;
    username: string;
    email: string;
    password: string;
    creationDate: Date;
}

export interface LocalDict {
    _id?: string;
    accountData?: AccountData;
    tokenData?: TokenData;
    reportData?: ReportData;
    logData?: LogData;
}
