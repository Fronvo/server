// ******************** //
// Interfaces for the login event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface LoginParams {
    email: string;
    password: string;
}

export interface LoginServerParams extends EventArguments, LoginParams {}

export interface LoginResult {
    token: string;
}

export interface LoginTestResult extends FronvoError, LoginResult {}
