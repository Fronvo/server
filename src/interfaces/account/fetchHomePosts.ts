// ******************** //
// Interfaces for the fetchHomePosts event file.
// ******************** //

import { Account, Post } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchHomePostsParams {}

export interface FetchHomePostsServerParams
    extends EventArguments,
        FetchHomePostsParams {}

export interface FetchHomePostsResult {
    homePosts: { post: Partial<Post>; profileData: Partial<Account> }[];
}

export interface FetchHomePostsTestResult
    extends FronvoError,
        FetchHomePostsResult {}
