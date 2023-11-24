// ******************** //
// Interfaces for the resetPasswordFinal event.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface ResetPasswordFinalParams {
    newPassword: string;
}

export interface ResetPasswordFinalServerParams
    extends EventArguments,
        ResetPasswordFinalParams {}

export interface ResetPasswordFinalResult {}

export interface ResetPasswordFinalTestResult
    extends FronvoError,
        ResetPasswordFinalResult {}
