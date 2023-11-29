// ******************** //
// Interfaces for the sendImage event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface SendImageParams {
    roomId: string;
    attachment: string;
}

export interface SendImageServerParams
    extends EventArguments,
        SendImageParams {}

export interface SendImageResult {}

export interface SendImageTestResult extends FronvoError, SendImageResult {}
