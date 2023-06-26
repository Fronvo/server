// ******************** //
// Interfaces for the startTyping event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface StartTypingParams {
    roomId: string;
}

export interface StartTypingServerParams
    extends EventArguments,
        StartTypingParams {}

export interface StartTypingResult {}

export interface StartTypingTestResult extends FronvoError, StartTypingResult {}
