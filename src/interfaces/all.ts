// ******************** //
// Interfaces for all kinds of files.
// ******************** //

import { FetchProfileDataParams, FetchProfileDataTestResult } from 'interfaces/account/fetchProfileData';
import { FetchProfileIdTestResult } from 'interfaces/account/fetchProfileId';
import { LogoutTestResult } from 'interfaces/account/logout';
import { IsLoggedInTestResult } from 'interfaces/general/isLoggedIn';
import { LoginParams, LoginTestResult } from 'interfaces/noAccount/login';
import { LoginTokenParams, LoginTokenTestResult } from 'interfaces/noAccount/loginToken';
import { RegisterParams, RegisterTestResult } from 'interfaces/noAccount/register';
import { Server, Socket } from 'socket.io';

// Only used for tests
export interface ClientToServerEvents {
    register: ({ email, password }: RegisterParams, callback?: ({}: RegisterTestResult) => void) => void;
    login: ({ email, password }: LoginParams, callback?: ({}: LoginTestResult) => void) => void;
    loginToken: ({ token }: LoginTokenParams, callback?: ({}: LoginTokenTestResult) => void) => void;
    isLoggedIn: (callback?: ({}: IsLoggedInTestResult) => void) => void;
    fetchProfileId: (callback?: ({}: FetchProfileIdTestResult) => void) => void;
    fetchProfileData: ({ profileId }: FetchProfileDataParams, callback?: ({}: FetchProfileDataTestResult) => void) => void;
    logout: (callback?: ({}: LogoutTestResult) => void) => void;
}

export interface ServerToClientEvents {
    // TODO: Start adding events which are called on their own here
    // with io.emit(...), not callback-able
}

export interface InterServerEvents {
    loginSocket: (socketId: string, accountId: string) => void;
    logoutSocket: (socketId: string) => void;
}

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
