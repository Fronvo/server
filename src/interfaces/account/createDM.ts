// ******************** //
// Interfaces for the createDM event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface CreateDMParams {
    profileId: string;
}

export interface CreateDMServerParams extends EventArguments, CreateDMParams {}

export interface CreateDMResult {
    roomId: string;
}

export interface CreateDMTestResult extends FronvoError, CreateDMResult {}
