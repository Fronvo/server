// ******************** //
// Interfaces for the updateProfileData event file.
// ******************** //

import { Account } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface UpdateProfileDataParams {
    username?: string;
    bio?: string;
    avatar?: string;
    banner?: string;
}

export interface UpdateProfileDataServerParams
    extends EventArguments,
        UpdateProfileDataParams {}

export interface UpdateProfileDataResult {
    profileData: Partial<Account>;
}

export interface UpdateProfileDataTestResult
    extends FronvoError,
        UpdateProfileDataResult {}
