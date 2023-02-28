// ******************** //
// Interfaces for the createPost event file.
// ******************** //

import { Post } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface CreatePostParams {
    content: string;
    attachment?: string;
}

export interface CreatePostServerParams
    extends EventArguments,
        CreatePostParams {}

export interface CreatePostResult {
    postData: Partial<Post>;
}

export interface CreatePostTestResult extends FronvoError, CreatePostResult {}
