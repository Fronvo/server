// ******************** //
// The removeConnectionSpotify account event file.
// ******************** //

import {
    RemoveConnectionSpotifyResult,
    RemoveConnectionSpotifyServerParams,
} from 'interfaces/account/removeConnectionSpotify';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { prismaClient } from 'variables/global';

async function removeConnectionSpotify({
    io,
    socket,
    account,
}: RemoveConnectionSpotifyServerParams): Promise<
    RemoveConnectionSpotifyResult | FronvoError
> {
    if (!account.hasSpotify) {
        return;
    }

    try {
        await prismaClient.account.update({
            where: {
                profileId: account.profileId,
            },

            data: {
                hasSpotify: false,
                spotifyName: '',
                spotifyRefreshToken: '',
                spotifyAccessToken: '',
                spotifyTokenType: '',
                spotifyURL: '',
            },
        });

        io.to(account.profileId)
            .to(socket.id)
            .emit('connectionsUpdated', {
                profileId: account.profileId,

                spotify: {
                    hasSpotify: false,
                    spotifyName: '',
                    spotifyURL: '',
                },
            });
    } catch (e) {}

    return {};
}

const removeConnectionSpotifyTemplate: EventTemplate = {
    func: removeConnectionSpotify,
    template: [],
};

export default removeConnectionSpotifyTemplate;
