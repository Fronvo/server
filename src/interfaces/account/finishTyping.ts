// ******************** //
// Interfaces for the finishTyping event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface FinishTypingParams {
    serverId?: string;
    roomId: string;
}

export interface FinishTypingServerParams
    extends EventArguments,
        FinishTypingParams {}

export interface FinishTypingResult {}

export interface FinishTypingTestResult
    extends FronvoError,
        FinishTypingResult {}
