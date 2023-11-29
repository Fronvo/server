// ******************** //
// Interfaces for the createServer event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all'

export interface CreateServerParams {
    name: string;
}

export interface CreateServerServerParams extends EventArguments, CreateServerParams {}

export interface CreateServerResult {}

export interface CreateServerTestResult extends FronvoError, CreateServerResult {}
