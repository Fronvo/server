// ******************** //
// Interfaces for the logout event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface LogoutParams {}

export interface LogoutServerParams extends EventArguments, LogoutParams {}

export interface LogoutResult {}

export interface LogoutTestResult extends FronvoError, LogoutResult {}
