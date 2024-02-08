// ******************** //
// The createDM account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { differenceInHours } from 'date-fns';
import { profileIdSchema } from 'events/shared';
import {
    CreateDMResult,
    CreateDMServerParams,
} from 'interfaces/account/createDM';
import { FetchedDM } from 'interfaces/account/fetchConvos';
import { FetchedFronvoAccount } from 'interfaces/account/fetchProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getAccountSocketId,
    isAccountLoggedIn,
} from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function createDM({
    io,
    socket,
    account,
    profileId,
}: CreateDMServerParams): Promise<CreateDMResult | FronvoError> {
    const targetAccount = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!targetAccount) {
        return generateError('ACCOUNT_404');
    }

    // Must be friends
    if (!targetAccount.friends.includes(account.profileId)) {
        return generateError('NOT_FRIEND');
    }

    let room = await prismaClient.dm.findFirst({
        where: {
            AND: [
                {
                    dmUsers: {
                        has: profileId,
                    },
                },
                {
                    dmUsers: {
                        has: account.profileId,
                    },
                },
            ],
        },
    });

    let unhidDm = false;

    // Make if new dm, otherwise set to visible if hidden
    if (!room) {
        try {
            room = await prismaClient.dm.create({
                data: {
                    roomId: v4(),
                    dmUsers: {
                        set: [profileId, account.profileId],
                    },
                },
            });
        } catch (e) {
            return generateError('UNKNOWN');
        }
    } else {
        if (room.dmHiddenFor?.includes(account.profileId)) {
            const newDmHiddenFor = room.dmHiddenFor;
            newDmHiddenFor.splice(newDmHiddenFor.indexOf(account.profileId), 1);

            try {
                await prismaClient.dm.update({
                    where: {
                        roomId: room.roomId,
                    },

                    data: {
                        dmHiddenFor: {
                            set: newDmHiddenFor,
                        },
                    },
                });

                unhidDm = true;
            } catch (e) {
                return generateError('UNKNOWN');
            }
        } else {
            return { roomId: room.roomId };
        }
    }

    // Give real room data
    const targetDMUserData: Partial<FetchedFronvoAccount> = {
        ...(await prismaClient.account.findFirst({
            where: {
                profileId: targetAccount.profileId,
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
            },
        })),

        isSelf: false,
        online: isAccountLoggedIn(targetAccount.profileId),
    };

    // Keep Room / DM only attributes
    // Clients MUST be able to differentiate from isDM
    const dm: Partial<FetchedDM> = {
        roomId: room.roomId,
        dmUsers: room.dmUsers,
        unreadCount: 0,
        dmUser: {
            profileId: targetDMUserData.profileId,
            username: targetDMUserData.username,
            bio: targetDMUserData.bio,
            creationDate: targetDMUserData.creationDate,
            avatar: targetDMUserData.avatar,
            banner: targetDMUserData.banner,
            status:
                differenceInHours(
                    new Date(),
                    new Date(targetDMUserData.statusUpdatedTime)
                ) < 24
                    ? targetDMUserData.status
                    : '',
            online: targetDMUserData.online,
        },
        dmHiddenFor: room.dmHiddenFor,
        totalMessages: await prismaClient.message.count({
            where: {
                roomId: room.roomId,
            },
        }),
    };

    // Notify both sockets about the new dm
    io.to(socket.id).emit('dmCreated', {
        dm,
    });

    // Only target socket knows about this
    if (!unhidDm) {
        io.sockets.sockets
            .get(getAccountSocketId(profileId))
            ?.emit('dmCreated', {
                dm,
            });
        io.sockets.sockets
            .get(getAccountSocketId(profileId))
            ?.join(room.roomId);
    }

    // Put target accounts to the dm's room
    io.sockets.sockets.get(socket.id).join(room.roomId);

    return { roomId: room.roomId };
}

const createDMTemplate: EventTemplate = {
    func: createDM,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default createDMTemplate;
