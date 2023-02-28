// ******************** //
// Interfaces for the createCommunity event file.
// ******************** //

import { Community } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface CreateCommunityParams {
    name: string;
    icon?: string;
}

export interface CreateCommunityServerParams
    extends EventArguments,
        CreateCommunityParams {}

export interface CreateCommunityResult {
    communityData: Partial<Community>;
}

export interface CreateCommunityTestResult
    extends FronvoError,
        CreateCommunityResult {}
