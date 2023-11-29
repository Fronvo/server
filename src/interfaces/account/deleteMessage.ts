// ******************** //
// Interfaces for the deleteMessage event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface DeleteMessageParams {
    roomId: string;
    messageId: string;
}

export interface DeleteMessageServerParams
    extends EventArguments,
        DeleteMessageParams {}

export interface DeleteMessageResult {}

export interface DeleteMessageTestResult
    extends FronvoError,
        DeleteMessageResult {}
