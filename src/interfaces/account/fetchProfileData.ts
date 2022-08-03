// ******************** //
// Interfaces for the fetchProfileData event file.
// ******************** //

import { Account } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchProfileDataParams {
    profileId: string;
}

export interface FetchProfileDataServerParams
    extends EventArguments,
        FetchProfileDataParams {}

export interface FetchedFronvoAccount extends Partial<Account> {
    isSelf: boolean;
    isFollower: boolean;
}

export interface FetchProfileDataResult {
    profileData: FetchedFronvoAccount;
}

export interface FetchProfileDataTestResult
    extends FronvoError,
        FetchProfileDataResult {}
