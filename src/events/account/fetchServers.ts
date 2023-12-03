// ******************** //
// The fetchServers account event file.
// ******************** //

import { Server } from '@prisma/client';
import {
    FetchServersResult,
    FetchServersServerParams,
} from 'interfaces/account/fetchServers';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchServers({
    account,
}: FetchServersServerParams): Promise<FetchServersResult | FronvoError> {
    let serversRaw: Partial<Server>[];

    try {
        serversRaw = await prismaClient.server.findMany({
            where: {
                members: {
                    has: account.profileId,
                },
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    let servers: Partial<Server>[] = [];
    async function gatherServers(): Promise<void> {
        return new Promise((resolve) => {
            if (serversRaw.length == 0) {
                resolve();
                return;
            }

            for (const serverIndex in serversRaw) {
                const server = serversRaw[serverIndex];

                servers[serverIndex] = {
                    serverId: server.serverId,
                    ownerId: server.ownerId,
                    creationDate: server.creationDate,
                    icon: server.icon,
                    members: server.members,
                    name: server.name,
                    description: server.description,
                    channels: server.channels,
                    roles: server.roles,
                };

                checkLoadingDone();
            }

            function checkLoadingDone() {
                let filledItems = 0;

                for (const serverIndex in servers) {
                    if (typeof servers[serverIndex] != 'undefined') {
                        filledItems += 1;
                    }
                }

                if (filledItems == serversRaw.length) {
                    resolve();
                }
            }
        });
    }

    await gatherServers();

    return { servers };
}

const fetchServersTemplate: EventTemplate = {
    func: fetchServers,
    template: [],
};

export default fetchServersTemplate;
