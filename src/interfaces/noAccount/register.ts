// ******************** //
// Interfaces for the register event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RegisterParams {
    email: string;
    password: string;
}

export interface RegisterServerParams extends EventArguments, RegisterParams {}

export interface RegisterResult {
    token: string;
}

export interface RegisterTestResult extends FronvoError, RegisterResult {}
