// ******************** //
// Interfaces for the acceptJoinRequest event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface AcceptJoinRequestParams {
    email: string;
}

export interface AcceptJoinRequestServerParams
    extends EventArguments,
        AcceptJoinRequestParams {}

export interface AcceptJoinRequestResult {}

export interface AcceptJoinRequestTestResult
    extends FronvoError,
        AcceptJoinRequestResult {}
