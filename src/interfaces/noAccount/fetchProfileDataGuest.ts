// ******************** //
// Interfaces for the fetchProfileData event file.
// ******************** //

import { Account } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchProfileDataGuestParams {
    profileId: string;
}

export interface FetchProfileDataGuestServerParams
    extends EventArguments,
        FetchProfileDataGuestParams {}

export interface FetchProfileDataGuestResult {
    profileData: Partial<Account>;
}

export interface FetchProfileDataGuestTestResult
    extends FronvoError,
        FetchProfileDataGuestResult {}
