// ******************** //
// Interfaces for the createPost event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface FindProfilesParams {
    profileId: string;
    maxResults?: string;
}

export interface FindProfilesServerParams
    extends EventArguments,
        FindProfilesParams {}

export interface FindProfilesResult {
    findResults: string[];
}

export interface FindProfilesTestResult
    extends FronvoError,
        FindProfilesResult {}
