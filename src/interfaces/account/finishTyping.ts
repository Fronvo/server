// ******************** //
// Interfaces for the finishTyping event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface FinishTypingParams {
    roomId: string;
}

export interface FinishTypingServerParams
    extends EventArguments,
        FinishTypingParams {}

export interface FinishTypingResult {}

export interface FinishTypingTestResult
    extends FronvoError,
        FinishTypingResult {}
