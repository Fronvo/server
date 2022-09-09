// ******************** //
// Interfaces for the findCommunities event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface FindCommunitiesParams {
    name: string;
    maxResults?: string;
}

export interface FindCommunitiesServerParams
    extends EventArguments,
        FindCommunitiesParams {}

export interface FindCommunitiesResult {
    findResults: string[];
}

export interface FindCommunitiesTestResult
    extends FronvoError,
        FindCommunitiesResult {}
