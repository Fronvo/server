// ******************** //
// Interfaces for the fetchCommunityMessages event file.
// ******************** //

import { CommunityMessage } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchCommunityMessagesParams {
    from: string;
    to: string;
}

export interface FetchCommunityMessagesServerParams
    extends EventArguments,
        FetchCommunityMessagesParams {}

export interface FetchCommunityMessagesResult {
    communityMessages: Partial<CommunityMessage>[];
}

export interface FetchCommunityMessagesTestResult
    extends FronvoError,
        FetchCommunityMessagesResult {}
