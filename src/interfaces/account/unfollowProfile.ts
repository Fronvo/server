// ******************** //
// Interfaces for the unfollowProfile event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface UnfollowProfileParams {
    profileId: string;
}

export interface UnfollowProfileServerParams
    extends EventArguments,
        UnfollowProfileParams {}

export interface UnfollowProfileResult {}

export interface UnfollowProfileTestResult
    extends FronvoError,
        UnfollowProfileResult {}
