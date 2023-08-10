// ******************** //
// Interfaces for the removeFCM event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RemoveFCMParams {}

export interface RemoveFCMServerParams
    extends EventArguments,
        RemoveFCMParams {}

export interface RemoveFCMResult {}

export interface RemoveFCMTestResult extends FronvoError, RemoveFCMResult {}
