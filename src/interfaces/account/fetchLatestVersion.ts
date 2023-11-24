// ******************** //
// Interfaces for the fetchLatestVersion event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchLatestVersionParams {}

export interface FetchLatestVersionServerParams
    extends EventArguments,
        FetchLatestVersionParams {}

export interface FetchLatestVersionResult {
    version: string;
}

export interface FetchLatestVersionTestResult
    extends FronvoError,
        FetchLatestVersionResult {}
