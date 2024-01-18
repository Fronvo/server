// ******************** //
// Interfaces for the sendMessage event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface SendMessageParams {
    roomId: string;
    message?: string;
    replyId?: string;
}

export interface SendMessageServerParams
    extends EventArguments,
        SendMessageParams {}

export interface SendMessageResult {}

export interface SendMessageTestResult extends FronvoError, SendMessageResult {}
