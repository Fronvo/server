// ******************** //
// Interfaces for the renameChannel event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RenameChannelParams {
    serverId: string;
    channelId: string;
    name: string;
}

export interface RenameChannelServerParams
    extends EventArguments,
        RenameChannelParams {}

export interface RenameChannelResult {}

export interface RenameChannelTestResult
    extends FronvoError,
        RenameChannelResult {}
