// ******************** //
// Interfaces for the fetchTurboCH event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchTurboCHParams {
    secret: string;
}

export interface FetchTurboCHServerParams
    extends EventArguments,
        FetchTurboCHParams {}

export interface FetchTurboCHResult {
    turboCH: string;
}

export interface FetchTurboCHTestResult
    extends FronvoError,
        FetchTurboCHResult {}
