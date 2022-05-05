// ******************** //
// Interfaces for the fetchProfileId event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchProfileIdParams {}

export interface FetchProfileIdServerParams
    extends EventArguments,
        FetchProfileIdParams {}

export interface FetchProfileIdResult {
    profileId: string;
}

export interface FetchProfileIdTestResult
    extends FronvoError,
        FetchProfileIdResult {}
