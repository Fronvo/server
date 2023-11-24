// ******************** //
// Interfaces for the applyPro event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface ApplyProParams {
    secret: string;
    proCH: string;
}

export interface ApplyProServerParams extends EventArguments, ApplyProParams {}

export interface ApplyProResult {}

export interface ApplyProTestResult extends FronvoError, ApplyProResult {}
