// ******************** //
// Interfaces for the addFriend event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface AddFriendParams {
    profileId: string;
}

export interface AddFriendServerParams
    extends EventArguments,
        AddFriendParams {}

export interface AddFriendResult {}

export interface AddFriendTestResult extends FronvoError, AddFriendResult {}
