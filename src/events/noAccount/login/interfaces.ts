// ******************** //
// Interfaces for the login no-account-only event file.
// ******************** //

import { EventArguments } from 'other/interfaces';

export interface Login extends EventArguments {
    email: string,
    password: string;
}

export interface LoginResult {
    token: string;
}