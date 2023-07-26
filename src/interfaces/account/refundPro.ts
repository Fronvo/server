// ******************** //
// Interfaces for the refundPro event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RefundProParams {
    secret: string;
}

export interface RefundProServerParams
    extends EventArguments,
        RefundProParams {}

export interface RefundProResult {}

export interface RefundProTestResult extends FronvoError, RefundProResult {}
