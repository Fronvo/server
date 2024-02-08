// ******************** //
// Interfaces for the deleteChannelMessage event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface DeleteChannelMessageParams {
    serverId: string;
    channelId: string;
    messageId: string;
}

export interface DeleteChannelMessageServerParams
    extends EventArguments,
        DeleteChannelMessageParams {}

export interface DeleteChannelMessageResult {}

export interface DeleteChannelMessageTestResult
    extends FronvoError,
        DeleteChannelMessageResult {}
