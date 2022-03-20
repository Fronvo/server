// ******************** //
// The no-account-only events interface file.
// ******************** //

import { EventArguments } from 'other/interfaces';

// register
export interface Register extends EventArguments {
    email: string;
    password: string;
}

export interface RegisterResult {
    token: string;
}

// login
export interface Login extends EventArguments {
    email: string,
    password: string;
}

export interface LoginResult {
    token: string;
}

// loginToken
export interface LoginToken extends EventArguments {
    token: string;
}

// Shared
export interface MinMaxEntries {
    email: {
        min?: number;
        max?: number;
    },

    password: {
        min?: number;
        max?: number;
    }
}
