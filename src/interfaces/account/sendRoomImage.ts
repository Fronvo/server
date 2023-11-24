// ******************** //
// Interfaces for the sendRoomImage event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface SendRoomImageParams {
    roomId: string;
    attachment: string;
}

export interface SendRoomImageServerParams
    extends EventArguments,
        SendRoomImageParams {}

export interface SendRoomImageResult {}

export interface SendRoomImageTestResult
    extends FronvoError,
        SendRoomImageResult {}
