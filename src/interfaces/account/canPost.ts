// ******************** //
// Interfaces for the canPost event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface CanPostParams {}

export interface CanPostServerParams extends EventArguments, CanPostParams {}

export interface CanPostResult {
    canPost: boolean;
}

export interface CanPostTestResult extends FronvoError, CanPostResult {}
