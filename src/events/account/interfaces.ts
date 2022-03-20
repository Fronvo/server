// ******************** //
// Interfaces for the account-only event files.
// ******************** //

import { Account, EventArguments } from 'other/interfaces';

// TODO: each event will have its own folder with interfaces and the event file.

// fetchProfileData
export interface FetchProfileData extends EventArguments {
    profileId: string;
}

export interface FetchProfileDataResult {
    profileData: Partial<Account>;
}

// fetchProfileId
export interface FetchProfileIdResult  {
    profileId: string;
}
