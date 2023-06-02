// ******************** //
// Interfaces for the updateProfileStatus event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface UpdateProfileStatusParams {
    status: string;
}

export interface UpdateProfileStatusServerParams
    extends EventArguments,
        UpdateProfileStatusParams {}

export interface UpdateProfileStatusResult {}

export interface UpdateProfileStatusTestResult
    extends FronvoError,
        UpdateProfileStatusResult {}
