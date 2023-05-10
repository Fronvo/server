// ******************** //
// Interfaces for the deleteRoomMessage event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface DeleteRoomMessageParams {
    messageId: string;
}

export interface DeleteRoomMessageServerParams
    extends EventArguments,
        DeleteRoomMessageParams {}

export interface DeleteRoomMessageResult {}

export interface DeleteRoomMessageTestResult
    extends FronvoError,
        DeleteRoomMessageResult {}
