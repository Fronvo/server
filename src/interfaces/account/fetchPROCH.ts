// ******************** //
// Interfaces for the fetchPROCH event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchPROCHParams {
    secret: string;
}

export interface FetchPROCHServerParams
    extends EventArguments,
        FetchPROCHParams {}

export interface FetchPROCHResult {
    proCH: string;
}

export interface FetchPROCHTestResult extends FronvoError, FetchPROCHResult {}
