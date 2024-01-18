// ******************** //
// Interfaces for the sendChannelMessage event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface SendChannelMessageParams {
    serverId: string;
    channelId: string;
    message?: string;
    replyId?: string;
}

export interface SendChannelMessageServerParams
    extends EventArguments,
        SendChannelMessageParams {}

export interface SendChannelMessageResult {}

export interface SendChannelMessageTestResult
    extends FronvoError,
        SendChannelMessageResult {}
