// ******************** //
// Interfaces for the regenerateServerInvite event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RegenerateServerInviteParams {
    serverId: string;
}

export interface RegenerateServerInviteServerParams
    extends EventArguments,
        RegenerateServerInviteParams {}

export interface RegenerateServerInviteResult {}

export interface RegenerateServerInviteTestResult
    extends FronvoError,
        RegenerateServerInviteResult {}
