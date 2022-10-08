// ******************** //
// Interfaces for the toggleDisableAccount event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface ToggleDisableAccountParams {
    profileId: string;
}

export interface ToggleDisableAccountServerParams
    extends EventArguments,
        ToggleDisableAccountParams {}

export interface ToggleDisableAccountResult {}

export interface ToggleDisableAccountTestResult
    extends FronvoError,
        ToggleDisableAccountResult {}
