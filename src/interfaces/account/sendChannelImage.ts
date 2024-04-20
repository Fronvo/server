// ******************** //
// Interfaces for the sendChannelImage event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface SendChannelImageParams {
    serverId: string;
    channelId: string;
    attachment: string;
    width: number;
    height: number;
}

export interface SendChannelImageServerParams
    extends EventArguments,
        SendChannelImageParams {}

export interface SendChannelImageResult {}

export interface SendChannelImageTestResult
    extends FronvoError,
        SendChannelImageResult {}
