// ******************** //
// Interfaces for the isLoggedIn event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface isLoggedInParams {}

export interface isLoggedInServerParams
    extends EventArguments,
        isLoggedInParams {}

export interface IsLoggedInResult {
    loggedIn: boolean;
}

export interface IsLoggedInTestResult extends FronvoError, IsLoggedInResult {}
