// ******************** //
// Interfaces for the likePost event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface LikePostParams {
    postId: string;
}

export interface LikePostServerParams extends EventArguments, LikePostParams {}

export interface LikePostResult {}

export interface LikePostTestResult extends FronvoError, LikePostResult {}
