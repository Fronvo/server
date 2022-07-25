// ******************** //
// Interfaces for the updateProfileData event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface UpdateProfileDataParams {
    username?: string;
    bio?: string;
    avatar?: string;
}

export interface UpdateProfileDataServerParams
    extends EventArguments,
        UpdateProfileDataParams {}

export interface UpdateProfileDataResult {}

export interface UpdateProfileDataTestResult
    extends FronvoError,
        UpdateProfileDataResult {}
