// ******************** //
// Interfaces for the rejectFriendRequest event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RejectFriendRequestParams {
    profileId: string;
}

export interface RejectFriendRequestServerParams
    extends EventArguments,
        RejectFriendRequestParams {}

export interface RejectFriendRequestResult {}

export interface RejectFriendRequestTestResult
    extends FronvoError,
        RejectFriendRequestResult {}
