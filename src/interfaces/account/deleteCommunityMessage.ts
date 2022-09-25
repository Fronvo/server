// ******************** //
// Interfaces for the deleteCommunityMessage event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface DeleteCommunityMessageParams {
    messageId: string;
}

export interface DeleteCommunityMessageServerParams
    extends EventArguments,
        DeleteCommunityMessageParams {}

export interface DeleteCommunityMessageResult {}

export interface DeleteCommunityMessageTestResult
    extends FronvoError,
        DeleteCommunityMessageResult {}
