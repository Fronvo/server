// ******************** //
// Interfaces for the resetPasswordVerify event.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface ResetPasswordVerifyParams {
    code: string;
}

export interface ResetPasswordVerifyServerParams
    extends EventArguments,
        ResetPasswordVerifyParams {}

export interface ResetPasswordVerifyResult {}

export interface ResetPasswordVerifyTestResult
    extends FronvoError,
        ResetPasswordVerifyResult {}
