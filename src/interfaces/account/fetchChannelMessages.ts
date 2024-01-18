// ******************** //
// Interfaces for the fetchChannelMessages event file.
// ******************** //

import { Account, ChannelMessage } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchChannelMessagesParams {
    serverId: string;
    channelId: string;
    from: string;
    to: string;
}

export interface FetchChannelMessagesServerParams
    extends EventArguments,
        FetchChannelMessagesParams {}

export interface FetchChannelMessagesResult {
    channelMessages: {
        message: Partial<ChannelMessage>;
        profileData: Partial<Account>;
    }[];
}

export interface FetchChannelMessagesTestResult
    extends FronvoError,
        FetchChannelMessagesResult {}
