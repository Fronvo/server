// ******************** //
// Interfaces for the fetchTenor event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchTenorParams {
    q: string;
}

export interface FetchTenorServerParams
    extends EventArguments,
        FetchTenorParams {}

export interface TenorGifs {
    gif: string;
    gif_medium: string;
    gif_tiny: string;
    gif_nano: string;
}

export interface FetchTenorResult {
    gifs: TenorGifs[];
}

export interface FetchTenorTestResult extends FronvoError, FetchTenorResult {}
