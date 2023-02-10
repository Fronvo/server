// ******************** //
// Interfaces for the fetchCommunityMessages event file.
// ******************** //

import { Account, CommunityMessage } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchCommunityMessagesParams {
    from: string;
    to: string;
}

export interface FetchCommunityMessagesServerParams
    extends EventArguments,
        FetchCommunityMessagesParams {}

export interface FetchCommunityMessagesResult {
    communityMessages: {
        message: Partial<CommunityMessage>;
        profileData: Partial<Account>;
    }[];
}

export interface FetchCommunityMessagesTestResult
    extends FronvoError,
        FetchCommunityMessagesResult {}
