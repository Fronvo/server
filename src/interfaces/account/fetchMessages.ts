// ******************** //
// Interfaces for the fetchMessages event file.
// ******************** //

import { Account, Message } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchMessagesParams {
    roomId: string;
    from: string;
    to: string;
}

export interface FetchMessagesServerParams
    extends EventArguments,
        FetchMessagesParams {}

export interface FetchMessagesResult {
    roomMessages: {
        message: Partial<Message>;
        profileData: Partial<Account>;
    }[];
}

export interface FetchMessagesTestResult
    extends FronvoError,
        FetchMessagesResult {}
