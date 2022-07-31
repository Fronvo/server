// ******************** //
// Interfaces for the fetchProfilePosts event file.
// ******************** //

import { Post } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchProfilePostsParams {
    profileId: string;
    from: string;
    to: string;
}

export interface FetchProfilePostsServerParams
    extends EventArguments,
        FetchProfilePostsParams {}

export interface FetchProfilePostsResult {
    profilePosts: Partial<Post>[];
}

export interface FetchProfilePostsTestResult
    extends FronvoError,
        FetchProfilePostsResult {}
