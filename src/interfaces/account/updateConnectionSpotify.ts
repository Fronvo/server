// ******************** //
// Interfaces for the updateConnectionSpotify event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface UpdateConnectionSpotifyParams {
    name: string;
    url: string;
    refreshToken: string;
    accessToken: string;
    tokenType: string;
    secret: string;
}

export interface UpdateConnectionSpotifyServerParams
    extends EventArguments,
        UpdateConnectionSpotifyParams {}

export interface UpdateConnectionSpotifyResult {}

export interface UpdateConnectionSpotifyTestResult
    extends FronvoError,
        UpdateConnectionSpotifyResult {}
