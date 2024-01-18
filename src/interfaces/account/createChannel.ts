// ******************** //
// Interfaces for the createChannel event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface CreateChannelParams {
    serverId: string;
    name: string;
}

export interface CreateChannelServerParams
    extends EventArguments,
        CreateChannelParams {}

export interface CreateChannelResult {}

export interface CreateChannelTestResult
    extends FronvoError,
        CreateChannelResult {}
