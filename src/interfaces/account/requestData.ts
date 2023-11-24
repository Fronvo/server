// ******************** //
// Interfaces for the requestData event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RequestDataParams {}

export interface RequestDataServerParams
    extends EventArguments,
        RequestDataParams {}

export interface RequestDataResult {}

export interface RequestDataTestResult extends FronvoError, RequestDataResult {}
