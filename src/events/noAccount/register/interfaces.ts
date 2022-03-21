// ******************** //
// Interfaces for the register no-account-only event file.
// ******************** //

import { EventArguments } from 'other/interfaces';

export interface Register extends EventArguments {
    email: string;
    password: string;
}

export interface RegisterResult {
    token: string;
}