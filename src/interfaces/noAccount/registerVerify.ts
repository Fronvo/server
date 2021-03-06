// ******************** //
// Interfaces for the registerVerify event.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RegisterVerifyParams {
    code: string;
}

export interface RegisterVerifyServerParams
    extends EventArguments,
        RegisterVerifyParams {}

export interface RegisterVerifyResult {
    token: string;
}

export interface RegisterVerifyTestResult
    extends FronvoError,
        RegisterVerifyResult {}
