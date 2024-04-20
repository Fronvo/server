// ******************** //
// The removeConnectionGithub account event file.
// ******************** //

import {
    RemoveConnectionGithubResult,
    RemoveConnectionGithubServerParams,
} from 'interfaces/account/removeConnectionGithub';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { prismaClient } from 'variables/global';

async function removeConnectionGithub({
    io,
    socket,
    account,
}: RemoveConnectionGithubServerParams): Promise<
    RemoveConnectionGithubResult | FronvoError
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
                hasGithub: false,
                githubName: '',
                githubURL: '',
            },
        });

        io.to(account.profileId)
            .to(socket.id)
            .emit('connectionsUpdated', {
                profileId: account.profileId,

                github: {
                    hasGithub: false,
                    githubName: '',
                    githubURL: '',
                },
            });
    } catch (e) {}

    return {};
}

const removeConnectionGithubTemplate: EventTemplate = {
    func: removeConnectionGithub,
    template: [],
};

export default removeConnectionGithubTemplate;
