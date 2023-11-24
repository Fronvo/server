// ******************** //
// Interfaces for the leaveRoom event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface LeaveRoomParams {
    roomId: string;
}

export interface LeaveRoomServerParams
    extends EventArguments,
        LeaveRoomParams {}

export interface LeaveRoomResult {}

export interface LeaveRoomTestResult extends FronvoError, LeaveRoomResult {}
