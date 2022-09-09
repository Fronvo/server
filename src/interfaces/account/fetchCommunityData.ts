// ******************** //
// Interfaces for the fetchCommunityData event file.
// ******************** //

import { Community } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchCommunityDataParams {
    communityId: string;
}

export interface FetchCommunityDataServerParams
    extends EventArguments,
        FetchCommunityDataParams {}

export interface FetchCommunityDataResult {
    communityData: Partial<Community>;
}

export interface FetchCommunityDataTestResult
    extends FronvoError,
        FetchCommunityDataResult {}
