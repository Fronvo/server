// ******************** //
// Interfaces for the applyTurbo event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface ApplyTurboParams {
    secret: string;
    turboCH: string;
}

export interface ApplyTurboServerParams
    extends EventArguments,
        ApplyTurboParams {}

export interface ApplyTurboResult {}

export interface ApplyTurboTestResult extends FronvoError, ApplyTurboResult {}
