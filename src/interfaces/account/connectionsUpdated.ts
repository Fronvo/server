// ******************** //
// Interfaces for the connectionsUpdated event file.
// ******************** //

export interface ConnectionsUpdatedParams {
    profileId: string;

    spotify?: {
        hasSpotify: boolean;
        spotifyName: string;
        spotifyURL: string;
    };

    github?: {
        hasGithub: boolean;
        githubName: string;
        githubURL: string;
    };
}
