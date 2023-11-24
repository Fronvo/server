// ******************** //
// Interfaces for the fetchThemes event file.
// ******************** //

import { Theme } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchThemesParams {}

export interface FetchThemesServerParams
    extends EventArguments,
        FetchThemesParams {}

export interface FetchThemesResult {
    themes: Partial<Theme>[];
}

export interface FetchThemesTestResult extends FronvoError, FetchThemesResult {}
