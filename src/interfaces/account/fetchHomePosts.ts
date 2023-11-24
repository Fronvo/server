// ******************** //
// Interfaces for the fetchHomePosts event file.
// ******************** //

import { Account } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';
import { FetchedFronvoPost } from './fetchProfilePosts';

export interface FetchHomePostsParams {
    from: string;
    to: string;
}

export interface FetchHomePostsServerParams
    extends EventArguments,
        FetchHomePostsParams {}

export interface FetchHomePostsResult {
    homePosts: { post: FetchedFronvoPost; profileData: Partial<Account> }[];
    totalPosts: number;
}

export interface FetchHomePostsTestResult
    extends FronvoError,
        FetchHomePostsResult {}
