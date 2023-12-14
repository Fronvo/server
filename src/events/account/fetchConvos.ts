// ******************** //
// The fetchConvos account event file.
// ******************** //

import { Dm } from '@prisma/client';
import {
    FetchConvosResult,
    FetchConvosServerParams,
    FetchedDM,
} from 'interfaces/account/fetchConvos';
import { FetchedFronvoAccount } from 'interfaces/account/fetchProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getTransformedImage,
    isAccountLoggedIn,
} from 'utilities/global';
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
                                                },
                                            }
                                        )),

                                        isSelf: false,
                                        online: isAccountLoggedIn(targetDMUser),
                                    };

                                // Keep Room / DM only attributes
                                // Clients MUST be able to differentiate from isDM
                                convos[convoIndex] = {
                                    roomId: convo.roomId,
                                    dmUsers: convo.dmUsers,
                                    dmUserOnline: targetDMUserData.online,
                                    unreadCount: unread,
                                    dmUser: {
                                        ...targetDMUserData,
                                        avatar:
                                            targetDMUserData.avatar &&
                                            getTransformedImage(
                                                targetDMUserData.avatar,
                                                72
                                            ),
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
                finalConvos.push(convo);
            }

            finalConvos.push(convo);
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
