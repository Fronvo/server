// ******************** //
// Interfaces for the fetchProfileData account-only event file.
// ******************** //

import { Account, EventArguments } from 'other/interfaces';

// fetchProfileData
export interface FetchProfileData extends EventArguments {
    profileId: string;
}

export interface FetchProfileDataResult {
    profileData: Partial<Account>;
}


