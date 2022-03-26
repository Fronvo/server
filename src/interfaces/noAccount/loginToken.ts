// ******************** //
// Interfaces for the loginToken event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface LoginTokenParams {
    token: string;
}

export interface LoginTokenServerParams extends EventArguments, LoginTokenParams {}

export interface LoginTokenResult {}

export interface LoginTokenTestResult extends FronvoError, LoginTokenResult {}
