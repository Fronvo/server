// ******************** //
// Interfaces for the refundTurbo event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RefundTurboParams {
    secret: string;
}

export interface RefundTurboServerParams
    extends EventArguments,
        RefundTurboParams {}

export interface RefundTurboResult {}

export interface RefundTurboTestResult extends FronvoError, RefundTurboResult {}
