// ******************** //
// Interfaces for the fetchHomePostsGuest event file.
// ******************** //

import { Account, Post } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchHomePostsGuestParams {
    from: string;
    to: string;
}

export interface FetchHomePostsGuestServerParams
    extends EventArguments,
        FetchHomePostsGuestParams {}

export interface FetchHomePostsGuestResult {
    totalPosts: number;
    homePosts: { post: Partial<Post>; profileData: Partial<Account> }[];
}

export interface FetchHomePostsGuestTestResult
    extends FronvoError,
        FetchHomePostsGuestResult {}
