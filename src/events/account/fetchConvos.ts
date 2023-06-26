// ******************** //
// The fetchConvos account event file.
// ******************** //

import { Room } from '@prisma/client';
import {
    FetchConvosResult,
    FetchConvosServerParams,
    FetchedDM,
    FetchedRoom,
} from 'interfaces/account/fetchConvos';
import { FetchedFronvoAccount } from 'interfaces/account/fetchProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getSocketAccountId,
    isAccountLoggedIn,
} from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchConvos({
    socket,
}: FetchConvosServerParams): Promise<FetchConvosResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    let convosRaw: Partial<Room>[];

    try {
        convosRaw = await prismaClient.room.findMany({
            where: {
                OR: [
                    {
                        members: {
                            has: account.profileId,
                        },
                    },
                    {
                        dmUsers: {
                            has: account.profileId,
                        },
                    },
                ],
            },

            take: 20,

            orderBy: {
                lastMessageAt: 'desc',
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    async function getUnreadCount(roomId: string): Promise<number> {
        const totalMessages = await prismaClient.roomMessage.count({
            where: {
                roomId,
            },
        });

        // @ts-ignore
        const seenStates: { [key: string]: number } = account.seenStates || {};

        if (!seenStates[roomId]) {
            seenStates[roomId] = totalMessages;
        }

        return totalMessages - seenStates[roomId];
    }

    const convos: Partial<FetchedDM | FetchedRoom>[] = [];

    async function gatherConvos(): Promise<void> {
        return new Promise((resolve) => {
            for (const convoIndex in convosRaw) {
                const convo = convosRaw[convoIndex];

                getUnreadCount(convo.roomId).then(async (unread) => {
                    if (convo.isDM) {
                        const targetDMUser =
                            convo.dmUsers[0] != account.profileId
                                ? (convo.dmUsers[0] as string)
                                : (convo.dmUsers[1] as string);

                        const targetDMUserData: FetchedFronvoAccount = {
                            ...(await prismaClient.account.findFirst({
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
                                },
                            })),

                            isSelf: false,
                            online: isAccountLoggedIn(targetDMUser),
                        };

                        // Keep Room / DM only attributes
                        // Clients MUST be able to differentiate from isDM
                        convos[convoIndex] = {
                            roomId: convo.roomId,
                            isDM: true,
                            dmUsers: convo.dmUsers,
                            lastMessage: convo.lastMessage,
                            lastMessageAt: convo.lastMessageAt,
                            lastMessageFrom: convo.lastMessageFrom,
                            dmUserOnline: isAccountLoggedIn(targetDMUser),
                            unreadCount: unread,
                            dmUser: targetDMUserData,
                        };
                    } else {
                        convos[convoIndex] = {
                            roomId: convo.roomId,
                            isDM: false,
                            creationDate: convo.creationDate,
                            icon: convo.icon,
                            lastMessage: convo.lastMessage,
                            lastMessageAt: convo.lastMessageAt,
                            lastMessageFrom: convo.lastMessageFrom,
                            members: convo.members,
                            name: convo.name,
                            ownerId: convo.ownerId,
                            unreadCount: unread,
                        };
                    }

                    checkLoadingDone();
                });
            }

            function checkLoadingDone() {
                let filledItems = 0;

                for (const convoIndex in convos) {
                    if (typeof convos[convoIndex] != 'undefined') {
                        filledItems += 1;
                    }
                }

                if (filledItems == convosRaw.length) resolve();
            }
        });
    }

    // Premature for empty array
    if (convosRaw.length == 0) return { convos: [] };

    await gatherConvos();

    return { convos };
}

const fetchConvosTemplate: EventTemplate = {
    func: fetchConvos,
    template: [],
};

export default fetchConvosTemplate;
