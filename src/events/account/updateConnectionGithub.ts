// ******************** //
// The updateConnectionGithub account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    UpdateConnectionGithubResult,
    UpdateConnectionGithubServerParams,
} from 'interfaces/account/updateConnectionGithub';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getLoggedInSockets } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { getEnv } from 'variables/varUtils';

async function updateConnectionGithub({
    io,
    socket,
    account,
    name,
    url,
    secret,
}: UpdateConnectionGithubServerParams): Promise<
    UpdateConnectionGithubResult | FronvoError
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
                hasGithub: true,
                githubName: name,
                githubURL: url,
            },
        });

        io.to(account.profileId)
            .to(socket.id)
            .emit('connectionsUpdated', {
                profileId: account.profileId,

                github: {
                    hasGithub: true,
                    githubName: name,
                    githubURL: url,
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

                    github: {
                        hasGithub: true,
                        githubName: name,
                        githubURL: url,
                    },
                });
            }
        }
    } catch (e) {}

    return {};
}

const updateConnectionGithubTemplate: EventTemplate = {
    func: updateConnectionGithub,
    template: ['name', 'url', 'secret'],
    schema: new StringSchema({
        name: {},

        url: {},

        secret: {
            minLength: 36,
        },
    }),
};

export default updateConnectionGithubTemplate;
