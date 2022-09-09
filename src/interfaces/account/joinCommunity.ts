// ******************** //
// Interfaces for the joinCommunity event file.
// ******************** //

import { Community } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';

export interface JoinCommunityParams {
    communityId: string;
}

export interface JoinCommunityServerParams
    extends EventArguments,
        JoinCommunityParams {}

export interface JoinCommunityResult {
    communityData: Partial<Community>;
}

export interface JoinCommunityTestResult
    extends FronvoError,
        JoinCommunityResult {}
