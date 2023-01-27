// ******************** //
// Interfaces for the fetchHomePosts event file.
// ******************** //

import { Account, Post } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchHomePostsParams {
    from: string;
    to: string;
}

export interface FetchHomePostsServerParams
    extends EventArguments,
        FetchHomePostsParams {}

export interface FetchHomePostsResult {
    totalPosts: number;
    homePosts: { post: Partial<Post>; profileData: Partial<Account> }[];
}

export interface FetchHomePostsTestResult
    extends FronvoError,
        FetchHomePostsResult {}
