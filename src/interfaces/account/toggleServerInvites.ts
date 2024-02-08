// ******************** //
// Interfaces for the toggleServerInvites event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface ToggleServerInvitesParams {
    serverId: string;
}

export interface ToggleServerInvitesServerParams
    extends EventArguments,
        ToggleServerInvitesParams {}

export interface ToggleServerInvitesResult {}

export interface ToggleServerInvitesTestResult
    extends FronvoError,
        ToggleServerInvitesResult {}
