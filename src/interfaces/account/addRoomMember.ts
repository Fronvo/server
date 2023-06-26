// ******************** //
// Interfaces for the addRoomMember event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface AddRoomMemberParams {
    roomId: string;
    profileId: string;
}

export interface AddRoomMemberServerParams
    extends EventArguments,
        AddRoomMemberParams {}

export interface AddRoomMemberResult {}

export interface AddRoomMemberTestResult
    extends FronvoError,
        AddRoomMemberResult {}
