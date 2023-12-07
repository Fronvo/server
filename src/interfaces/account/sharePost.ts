// ******************** //
// Interfaces for the sharePost event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface SharePostParams {
    attachment?: string;
}

export interface SharePostServerParams
    extends EventArguments,
        SharePostParams {}

export interface SharePostResult {}

export interface SharePostTestResult extends FronvoError, SharePostResult {}
