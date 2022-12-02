// ******************** //
// Interfaces for the listJoinRequests event file.
// ******************** //

import { JoinRequests } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';

export interface ListJoinRequestsParams {}

export interface ListJoinRequestsServerParams
    extends EventArguments,
        ListJoinRequestsParams {}

export interface ListJoinRequestsResult {
    joinRequests: Partial<JoinRequests>[];
}

export interface ListJoinRequestsTestResult
    extends FronvoError,
        ListJoinRequestsResult {}
