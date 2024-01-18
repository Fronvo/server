// ******************** //
// The fetchServers account event file.
// ******************** //

import { Channel, Server } from '@prisma/client';
import {
    FetchServersResult,
    FetchServersServerParams,
} from 'interfaces/account/fetchServers';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getTransformedImage } from 'utilities/global';
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

    async function gatherChannels(channels: any[]): Promise<Channel[]> {
        return new Promise(async (resolve) => {
            if (channels.length == 0) {
                resolve([]);
                return;
            }

            resolve(
                await prismaClient.channel.findMany({
                    where: {
                        channelId: {
                            in: channels,
                        },
                    },
                })
            );
        });
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

                gatherChannels(server.channels).then((channels) => {
                    servers[serverIndex] = {
                        serverId: server.serverId,
                        ownerId: server.ownerId,
                        creationDate: server.creationDate,
                        icon:
                            server.icon && getTransformedImage(server.icon, 96),
                        members: server.members,
                        name: server.name,
                        channels: channels as [],
                        roles: server.roles,
                    };

                    checkLoadingDone();
                });
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
