// ******************** //
// Interfaces for the deleteAccount event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface DeleteAccountParams {
    password: string;
}

export interface DeleteAccountServerParams
    extends EventArguments,
        DeleteAccountParams {}

export interface DeleteAccountResult {}

export interface DeleteAccountTestResult
    extends FronvoError,
        DeleteAccountResult {}
