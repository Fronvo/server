// ******************** //
// Interfaces for the deleteServer event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface DeleteServerParams {
    serverId: string;
}

export interface DeleteServerServerParams
    extends EventArguments,
        DeleteServerParams {}

export interface DeleteServerResult {}

export interface DeleteServerTestResult
    extends FronvoError,
        DeleteServerResult {}
