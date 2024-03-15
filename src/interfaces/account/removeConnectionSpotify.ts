// ******************** //
// Interfaces for the removeConnectionSpotify event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RemoveConnectionSpotifyParams {}

export interface RemoveConnectionSpotifyServerParams
    extends EventArguments,
        RemoveConnectionSpotifyParams {}

export interface RemoveConnectionSpotifyResult {}

export interface RemoveConnectionSpotifyTestResult
    extends FronvoError,
        RemoveConnectionSpotifyResult {}
