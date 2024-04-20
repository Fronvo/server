// ******************** //
// The fetchConvos account event file.
// ******************** //

import { Dm } from '@prisma/client';
import { differenceInHours } from 'date-fns';
import {
    FetchConvosResult,
    FetchConvosServerParams,
    FetchedDM,
} from 'interfaces/account/fetchConvos';
import { FetchedFronvoAccount } from 'interfaces/account/fetchProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, isAccountLoggedIn } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchConvos({
    account,
}: FetchConvosServerParams): Promise<FetchConvosResult | FronvoError> {
    let convosRaw: Partial<Dm>[];

    try {
        convosRaw = await prismaClient.dm.findMany({
            where: {
                dmUsers: {
                    has: account.profileId,
                },
            },

            orderBy: {
                lastMessageAt: 'desc',
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    async function getUnreadCount(
        totalMessages: number,
        roomId: string
    ): Promise<number> {
        // @ts-ignore
        const seenStates: { [key: string]: number } = account.seenStates || {};

        if (!seenStates[roomId]) {
            seenStates[roomId] = totalMessages;
        }

        return totalMessages - seenStates[roomId];
    }

    let convos: Partial<FetchedDM>[] = [];
    let hiddenConvos = 0;

    async function gatherConvos(): Promise<void> {
        return new Promise((resolve) => {
            if (convosRaw.length == 0) {
                resolve();
                return;
            }

            for (const convoIndex in convosRaw) {
                const convo = convosRaw[convoIndex];

                prismaClient.message
                    .count({
                        where: {
                            roomId: convo.roomId,
                        },
                    })
                    .then((totalMessages) => {
                        getUnreadCount(totalMessages, convo.roomId).then(
                            async (unread) => {
                                const targetDMUser =
                                    convo.dmUsers[0] != account.profileId
                                        ? (convo.dmUsers[0] as string)
                                        : (convo.dmUsers[1] as string);

                                const isFriend =
                                    account.friends.includes(targetDMUser);

                                const targetDMUserData: Partial<FetchedFronvoAccount> =
                                    {
                                        ...(await prismaClient.account.findFirst(
                                            {
                                                where: {
                                                    profileId: targetDMUser,
                                                },

                                                select: {
                                                    profileId: true,
                                                    username: true,
                                                    avatar: true,
                                                    banner: true,
                                                    bio: true,
                                                    creationDate: true,
                                                    turbo: true,
                                                    status: true,
                                                    statusUpdatedTime: true,
                                                    hasSpotify: true,
                                                    spotifyName: true,
                                                    spotifyURL: true,
                                                },
                                            }
                                        )),

                                        isSelf: false,
                                        online: isAccountLoggedIn(targetDMUser),
                                    };

                                convos[convoIndex] = {
                                    roomId: convo.roomId,
                                    unreadCount: unread,
                                    dmUser: {
                                        profileId: targetDMUserData.profileId,
                                        username: targetDMUserData.username,
                                        bio: targetDMUserData.bio,
                                        creationDate:
                                            targetDMUserData.creationDate,
                                        avatar: targetDMUserData.avatar,
                                        banner: targetDMUserData.banner,
                                        status:
                                            isFriend &&
                                            differenceInHours(
                                                new Date(),
                                                new Date(
                                                    targetDMUserData.statusUpdatedTime
                                                )
                                            ) < 24
                                                ? targetDMUserData.status
                                                : '',
                                        online:
                                            isFriend && targetDMUserData.online,
                                        hasSpotify: targetDMUserData.hasSpotify,
                                        spotifyName:
                                            targetDMUserData.spotifyName,
                                        spotifyURL: targetDMUserData.spotifyURL,
                                        hasGithub: targetDMUserData.hasGithub,
                                        githubName: targetDMUserData.githubName,
                                        githubURL: targetDMUserData.githubURL,
                                    },
                                    dmHiddenFor: convo.dmHiddenFor,
                                    totalMessages,
                                };

                                checkLoadingDone();
                            }
                        );

                        function checkLoadingDone() {
                            let filledItems = 0;

                            for (const convoIndex in convos) {
                                if (typeof convos[convoIndex] != 'undefined') {
                                    filledItems += 1;
                                }
                            }

                            // Count hidden DMs aswell
                            if (filledItems + hiddenConvos == convosRaw.length)
                                resolve();
                        }
                    });
            }
        });
    }

    function removeHiddenConvos(): void {
        let finalConvos: Partial<FetchedDM>[] = [];

        for (const convoIndex in convos) {
            const convo = convos[convoIndex];

            if (!convo.dmHiddenFor?.includes(account?.profileId)) {
                // Remove properties we dont wanna expose to client
                delete convo.dmHiddenFor;

                finalConvos.push(convo);
            }
        }

        convos = finalConvos;
    }

    await gatherConvos();
    removeHiddenConvos();

    return { convos };
}

const fetchConvosTemplate: EventTemplate = {
    func: fetchConvos,
    template: [],
};

export default fetchConvosTemplate;
