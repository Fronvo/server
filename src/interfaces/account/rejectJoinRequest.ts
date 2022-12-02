// ******************** //
// Interfaces for the rejectJoinRequest event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RejectJoinRequestParams {
    email: string;
}

export interface RejectJoinRequestServerParams
    extends EventArguments,
        RejectJoinRequestParams {}

export interface RejectJoinRequestResult {}

export interface RejectJoinRequestTestResult
    extends FronvoError,
        RejectJoinRequestResult {}
