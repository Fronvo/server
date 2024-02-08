// ******************** //
// Interfaces for the leaveServer event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface LeaveServerParams {
    serverId: string;
}

export interface LeaveServerServerParams
    extends EventArguments,
        LeaveServerParams {}

export interface LeaveServerResult {}

export interface LeaveServerTestResult extends FronvoError, LeaveServerResult {}
