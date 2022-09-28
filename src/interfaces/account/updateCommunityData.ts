// ******************** //
// Interfaces for the updateProfileData event file.
// ******************** //

import { Community } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface UpdateCommunityDataParams {
    communityId?: string;
    name?: string;
    description?: string;
    icon?: string;
    inviteOnly?: boolean;
}

export interface UpdateCommunityDataServerParams
    extends EventArguments,
        UpdateCommunityDataParams {}

export interface UpdateCommunityDataResult {
    communityData: Partial<Community>;
}

export interface UpdateCommunityDataTestResult
    extends FronvoError,
        UpdateCommunityDataResult {}
