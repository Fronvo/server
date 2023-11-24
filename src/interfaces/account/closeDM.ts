// ******************** //
// Interfaces for the closeDM event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface CloseDMParams {
    roomId: string;
}

export interface CloseDMServerParams extends EventArguments, CloseDMParams {}

export interface CloseDMResult {}

export interface CloseDMTestResult extends FronvoError, CloseDMResult {}
