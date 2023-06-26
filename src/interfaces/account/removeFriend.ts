// ******************** //
// Interfaces for the removeFriend event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RemoveFriendParams {
    profileId: string;
}

export interface RemoveFriendServerParams
    extends EventArguments,
        RemoveFriendParams {}

export interface RemoveFriendResult {}

export interface RemoveFriendTestResult
    extends FronvoError,
        RemoveFriendResult {}
