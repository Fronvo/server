// ******************** //
// Interfaces for the updateProfileData event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface UpdateProfileDataParams {
    username?: string;
    avatar?: string;
}

export interface UpdateProfileDataServerParams
    extends EventArguments,
        UpdateProfileDataParams {}

export interface UpdateProfileDataResult {}

export interface FetchProfileDataTestResult
    extends FronvoError,
        UpdateProfileDataResult {}
