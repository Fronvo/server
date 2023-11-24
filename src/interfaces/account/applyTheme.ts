// ******************** //
// Interfaces for the applyTheme event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface ApplyThemeParams {
    title: string;
}

export interface ApplyThemeServerParams
    extends EventArguments,
        ApplyThemeParams {}

export interface ApplyThemeResult {}

export interface ApplyThemeTestResult extends FronvoError, ApplyThemeResult {}
