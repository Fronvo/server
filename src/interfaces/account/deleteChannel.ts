// ******************** //
// Interfaces for the deleteChannel event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all'

export interface DeleteChannelParams {
    serverId: string;
    channelId: string;
}

export interface DeleteChannelServerParams extends EventArguments, DeleteChannelParams {}

export interface DeleteChannelResult {}

export interface DeleteChannelTestResult extends FronvoError, DeleteChannelResult {}
