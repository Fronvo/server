// ******************** //
// Interfaces for the connectionsUpdated event file.
// ******************** //

export interface ConnectionsUpdatedParams {
    profileId: string;

    spotify: {
        hasSpotify: boolean;
        spotifyName: string;
        spotifyURL: string;
    };
}
