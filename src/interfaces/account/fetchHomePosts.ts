// ******************** //
// Interfaces for the fetchHomePosts event file.
// ******************** //

import { Account, Post } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchHomePostsParams {
    from: string;
    to: string;
}

export interface FetchHomePostsServerParams
    extends EventArguments,
        FetchHomePostsParams {}

export interface FetchHomePostsResult {
    homePosts: { post: Partial<Post>; profileData: Partial<Account> }[];
    totalPosts: number;
}

export interface FetchHomePostsTestResult
    extends FronvoError,
        FetchHomePostsResult {}
