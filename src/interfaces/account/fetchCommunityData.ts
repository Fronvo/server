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

export interface FetchedFronvoCommunity extends Partial<Community> {
    totalMessages: number;
}

export interface FetchCommunityDataResult {
    communityData: FetchedFronvoCommunity;
}

export interface FetchCommunityDataTestResult
    extends FronvoError,
        FetchCommunityDataResult {}
