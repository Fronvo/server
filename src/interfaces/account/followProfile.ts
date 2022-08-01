// ******************** //
// Interfaces for the followProfile event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface FollowProfileParams {
    profileId: string;
}

export interface FollowProfileServerParams
    extends EventArguments,
        FollowProfileParams {}

export interface FollowProfileResult {}

export interface FollowProfileTestResult
    extends FronvoError,
        FollowProfileResult {}
