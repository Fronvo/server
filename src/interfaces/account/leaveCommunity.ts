// ******************** //
// Interfaces for the leaveCommunity event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface LeaveCommunityParams {}

export interface LeaveCommunityServerParams
    extends EventArguments,
        LeaveCommunityParams {}

export interface LeaveCommunityResult {}

export interface LeaveCommunityTestResult
    extends FronvoError,
        LeaveCommunityResult {}
