// ******************** //
// Interfaces for the clearProfileStatus event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface ClearProfileStatusParams {}

export interface ClearProfileStatusServerParams
    extends EventArguments,
        ClearProfileStatusParams {}

export interface ClearProfileStatusResult {}

export interface ClearProfileStatusTestResult
    extends FronvoError,
        ClearProfileStatusResult {}
