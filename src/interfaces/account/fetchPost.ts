// ******************** //
// Interfaces for the fetchPost event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchPostParams {}

export interface FetchPostServerParams
    extends EventArguments,
        FetchPostParams {}

export interface FetchPostResult {}

export interface FetchPostTestResult extends FronvoError, FetchPostResult {}
