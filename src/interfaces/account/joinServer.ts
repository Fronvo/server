// ******************** //
// Interfaces for the joinServer event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface JoinServerParams {
    invite: string;
}

export interface JoinServerServerParams
    extends EventArguments,
        JoinServerParams {}

export interface JoinServerResult {}

export interface JoinServerTestResult extends FronvoError, JoinServerResult {}
