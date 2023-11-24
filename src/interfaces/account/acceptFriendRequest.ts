// ******************** //
// Interfaces for the acceptFriendRequest event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface AcceptFriendRequestParams {
    profileId: string;
}

export interface AcceptFriendRequestServerParams
    extends EventArguments,
        AcceptFriendRequestParams {}

export interface AcceptFriendRequestResult {}

export interface AcceptFriendRequestTestResult
    extends FronvoError,
        AcceptFriendRequestResult {}
