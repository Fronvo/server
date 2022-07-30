// ******************** //
// Interfaces for the fetchProfileData event file.
// ******************** //

import { FronvoAccount, FronvoError, EventArguments } from 'interfaces/all';

export interface FetchProfileDataParams {
    profileId: string;
}

export interface FetchProfileDataServerParams
    extends EventArguments,
        FetchProfileDataParams {}

export interface FetchedFronvoAccount extends Partial<FronvoAccount> {
    isSelf: boolean;
}

export interface FetchProfileDataResult {
    profileData: FetchedFronvoAccount;
}

export interface FetchProfileDataTestResult
    extends FronvoError,
        FetchProfileDataResult {}
