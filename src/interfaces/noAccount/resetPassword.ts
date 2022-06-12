// ******************** //
// Interfaces for the resetPassword event.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface ResetPasswordParams {
    email: string;
}

export interface ResetPasswordServerParams
    extends EventArguments,
        ResetPasswordParams {}

export interface ResetPasswordResult {}

export interface ResetPasswordTestResult
    extends FronvoError,
        ResetPasswordResult {}
