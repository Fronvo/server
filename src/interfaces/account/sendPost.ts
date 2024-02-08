// ******************** //
// Interfaces for the sendPost event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface SendPostParams {
    profileId: string;
    postId: string;
}

export interface SendPostServerParams extends EventArguments, SendPostParams {}

export interface SendPostResult {}

export interface SendPostTestResult extends FronvoError, SendPostResult {}
