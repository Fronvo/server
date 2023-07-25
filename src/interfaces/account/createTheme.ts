// ******************** //
// Interfaces for the createTheme event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface CreateThemeParams {
    title: string;
    brandingWhite: string;
    brandingDarkenWhite: string;
    brandingDark: string;
    brandingDarkenDark: string;
}

export interface CreateThemeServerParams
    extends EventArguments,
        CreateThemeParams {}

export interface CreateThemeResult {}

export interface CreateThemeTestResult extends FronvoError, CreateThemeResult {}
