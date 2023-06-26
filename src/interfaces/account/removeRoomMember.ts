// ******************** //
// Interfaces for the removeRoomMember event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RemoveRoomMemberParams {
    roomId: string;
    profileId: string;
}

export interface RemoveRoomMemberServerParams
    extends EventArguments,
        RemoveRoomMemberParams {}

export interface RemoveRoomMemberResult {}

export interface RemoveRoomMemberTestResult
    extends FronvoError,
        RemoveRoomMemberResult {}
