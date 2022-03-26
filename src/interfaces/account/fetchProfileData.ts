// ******************** //
// Interfaces for the fetchProfileData event file.
// ******************** //

import { Account, FronvoError, EventArguments } from 'interfaces/all';

export interface FetchProfileDataParams {
    profileId: string;
}

export interface FetchProfileDataServerParams extends EventArguments, FetchProfileDataParams {}

export interface FetchProfileDataResult {
    profileData: Partial<Account>;
}

export interface FetchProfileDataTestResult extends FronvoError, FetchProfileDataResult {}
