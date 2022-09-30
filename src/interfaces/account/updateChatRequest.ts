// ******************** //
// Interfaces for the updateChatRequest event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface UpdateChatRequestParams {
    profileId: string;
    accepted: boolean;
}

export interface UpdateChatRequestServerParams
    extends EventArguments,
        UpdateChatRequestParams {}

export interface UpdateChatRequestResult {}

export interface UpdateChatRequestTestResult
    extends FronvoError,
        UpdateChatRequestResult {}
