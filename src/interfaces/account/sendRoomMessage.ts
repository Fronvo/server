// ******************** //
// Interfaces for the sendRoomMessage event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface SendRoomMessageParams {
    message: string;
    replyId?: string;
}

export interface SendRoomMessageServerParams
    extends EventArguments,
        SendRoomMessageParams {}

export interface SendRoomMessageResult {}

export interface SendRoomMessageTestResult
    extends FronvoError,
        SendRoomMessageResult {}
