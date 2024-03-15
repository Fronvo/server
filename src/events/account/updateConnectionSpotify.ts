// ******************** //
// The updateConnectionSpotify account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    UpdateConnectionSpotifyResult,
    UpdateConnectionSpotifyServerParams,
} from 'interfaces/account/updateConnectionSpotify';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getLoggedInSockets } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { getEnv } from 'variables/varUtils';

async function updateConnectionSpotify({
    io,
    socket,
    account,
    name,
    url,
    refreshToken,
    accessToken,
    tokenType,
    secret,
}: UpdateConnectionSpotifyServerParams): Promise<
    UpdateConnectionSpotifyResult | FronvoError
> {
    if (secret != getEnv('GENERAL_SECRET')) {
        return generateError('UNKNOWN');
    }

    try {
        await prismaClient.account.update({
            where: {
                profileId: account.profileId,
            },

            data: {
                hasSpotify: true,
                spotifyName: name,
                spotifyURL: url,
                spotifyRefreshToken: refreshToken,
                spotifyAccessToken: accessToken,
                spotifyTokenType: tokenType,
            },
        });

        io.to(account.profileId)
            .to(socket.id)
            .emit('connectionsUpdated', {
                profileId: account.profileId,

                spotify: {
                    hasSpotify: true,
                    spotifyName: name,
                    spotifyURL: url,
                },
            });

        // To all sockets in this account
        const targetSockets = getLoggedInSockets();

        for (const socketIndex in targetSockets) {
            const socketObj = targetSockets[socketIndex];

            if (
                socketObj.accountId == account.profileId &&
                socketObj.socket.id != socket.id
            ) {
                io.to(socketObj.socket.id).emit('connectionsUpdated', {
                    profileId: account.profileId,

                    spotify: {
                        hasSpotify: true,
                        spotifyName: name,
                        spotifyURL: url,
                    },
                });
            }
        }
    } catch (e) {}

    return {};
}

const updateConnectionsTemplate: EventTemplate = {
    func: updateConnectionSpotify,
    template: [
        'name',
        'url',
        'refreshToken',
        'accessToken',
        'tokenType',
        'secret',
    ],
    schema: new StringSchema({
        name: {},

        url: {},

        refreshToken: {},

        accessToken: {},

        tokenType: {},

        secret: {
            minLength: 36,
        },
    }),
};

export default updateConnectionsTemplate;
