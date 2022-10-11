// ******************** //
// Interfaces for the sendCommunityMessage event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface SendCommunityMessageParams {
    message: string;
    replyId?: string;
}

export interface SendCommunityMessageServerParams
    extends EventArguments,
        SendCommunityMessageParams {}

export interface SendCommunityMessageResult {}

export interface SendCommunityMessageTestResult
    extends FronvoError,
        SendCommunityMessageResult {}
