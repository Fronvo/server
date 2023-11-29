// ******************** //
// The deleteAccount account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { passwordSchema } from 'events/shared';
import {
    DeleteAccountResult,
    DeleteAccountServerParams,
} from 'interfaces/account/deleteAccount';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { deleteImage, generateError, sendEmail } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { compareSync } from 'bcrypt';

async function deleteAccount({
    io,
    account,
    password,
}: DeleteAccountServerParams): Promise<DeleteAccountResult | FronvoError> {
    if (!compareSync(password, account.password)) {
        return generateError('INVALID', undefined, ['password']);
    }

    // Remove from all friends' (and pending ones) lists

    // Find pending requests
    const pendingAccountRequests = await prismaClient.account.findMany({
        where: {
            pendingFriendRequests: {
                has: account.profileId,
            },
        },

        select: {
            profileId: true,
            pendingFriendRequests: true,
        },
    });

    // Find friends
    const accountFriends = await prismaClient.account.findMany({
        where: {
            friends: {
                has: account.profileId,
            },
        },

        select: {
            profileId: true,
            friends: true,
        },
    });

    try {
        async function updatePending(): Promise<void> {
            let completedPending = 0;

            return new Promise((resolve) => {
                for (const accountIndex in pendingAccountRequests) {
                    const targetAccount = pendingAccountRequests[accountIndex];

                    const newPendingFriends =
                        targetAccount.pendingFriendRequests;
                    newPendingFriends.splice(
                        newPendingFriends.indexOf(account.profileId),
                        1
                    );

                    prismaClient.account
                        .update({
                            where: {
                                profileId: targetAccount.profileId,
                            },

                            data: {
                                pendingFriendRequests: {
                                    set: newPendingFriends,
                                },
                            },
                        })
                        .then(() => {
                            completedPending += 1;

                            if (
                                completedPending ==
                                pendingAccountRequests.length
                            ) {
                                resolve();
                            }
                        });
                }
            });
        }

        async function updateFriends(): Promise<void> {
            return new Promise((resolve) => {
                let completedFriends = 0;

                for (const accountIndex in accountFriends) {
                    const targetAccount = accountFriends[accountIndex];

                    const newFriends = targetAccount.friends;
                    newFriends.splice(newFriends.indexOf(account.profileId), 1);

                    prismaClient.account
                        .update({
                            where: {
                                profileId: targetAccount.profileId,
                            },

                            data: {
                                friends: {
                                    set: newFriends,
                                },
                            },
                        })
                        .then(() => {
                            completedFriends += 1;

                            if (completedFriends == accountFriends.length) {
                                resolve();
                            }
                        });
                }
            });
        }

        async function deleteAccountData(): Promise<void> {
            await deleteOwnedRooms();
            await leaveRooms();
            await deleteLikes();
            await deleteAccount();

            async function deleteAccount(): Promise<void> {
                // Delete all account content
                await prismaClient.account.delete({
                    where: {
                        profileId: account.profileId,
                    },
                });

                deleteImage(account.avatar);
                deleteImage(account.banner);

                await prismaClient.token.delete({
                    where: {
                        profileId: account.profileId,
                    },
                });

                const deletedPosts = await prismaClient.post.findMany({
                    where: {
                        author: account.profileId,
                    },
                });

                await prismaClient.post.deleteMany({
                    where: {
                        author: account.profileId,
                    },
                });

                for (const postIndex in deletedPosts) {
                    const post = deletedPosts[postIndex];

                    deleteImage(post.attachment);
                }

                const deletedMessages = await prismaClient.message.findMany({
                    where: {
                        ownerId: account.profileId,
                    },
                });

                await prismaClient.message.deleteMany({
                    where: {
                        ownerId: account.profileId,
                    },
                });

                for (const messageIndex in deletedMessages) {
                    const message = deletedMessages[messageIndex];

                    deleteImage(message.attachment);
                }
            }

            async function deleteOwnedRooms(): Promise<void> {
                return new Promise(async (resolve) => {
                    const roomsToDelete = await prismaClient.room.findMany({
                        where: {
                            ownerId: account.profileId,
                        },

                        select: {
                            roomId: true,
                            icon: true,
                        },
                    });

                    if (roomsToDelete.length == 0) {
                        resolve();
                        return;
                    }

                    let deletedRooms = 0;

                    for (const roomIndex in roomsToDelete) {
                        const room = roomsToDelete[roomIndex];

                        // Delete rooms and all related messages
                        prismaClient.room
                            .delete({
                                where: {
                                    roomId: room.roomId,
                                },
                            })
                            .then(() => {
                                prismaClient.message
                                    .deleteMany({
                                        where: {
                                            roomId: room.roomId,
                                        },
                                    })
                                    .then(() => {
                                        deletedRooms += 1;

                                        deleteImage(room.icon);

                                        if (
                                            deletedRooms == roomsToDelete.length
                                        ) {
                                            resolve();
                                        }
                                    });
                            });
                    }
                });
            }

            async function leaveRooms(): Promise<void> {
                return new Promise(async (resolve) => {
                    const roomsToLeave = await prismaClient.room.findMany({
                        where: {
                            members: {
                                has: account.profileId,
                            },
                        },

                        select: {
                            roomId: true,
                            members: true,
                        },
                    });

                    if (roomsToLeave.length == 0) {
                        resolve();
                        return;
                    }

                    let leftRooms = 0;

                    for (const roomIndex in roomsToLeave) {
                        const room = roomsToLeave[roomIndex];

                        const newMembers = room.members;
                        newMembers.splice(
                            newMembers.indexOf(account.profileId),
                            1
                        );

                        // Delete rooms and all related messages
                        prismaClient.room
                            .update({
                                where: {
                                    roomId: room.roomId,
                                },

                                data: {
                                    members: {
                                        set: newMembers,
                                    },
                                },
                            })
                            .then(() => {
                                // Member left, update members
                                io.to(room.roomId).emit('memberLeft', {
                                    roomId: room.roomId,
                                    profileId: account.profileId,
                                });

                                leftRooms += 1;

                                if (leftRooms == roomsToLeave.length) {
                                    resolve();
                                }
                            });
                    }
                });
            }

            async function deleteLikes(): Promise<void> {
                return new Promise(async (resolve) => {
                    const likesToDelete = await prismaClient.post.findMany({
                        where: {
                            likes: {
                                has: account.profileId,
                            },
                        },

                        select: {
                            postId: true,
                            likes: true,
                        },
                    });

                    if (likesToDelete.length == 0) {
                        resolve();
                        return;
                    }

                    let deletedLikes = 0;

                    for (const likeIndex in likesToDelete) {
                        const post = likesToDelete[likeIndex];

                        const newLikes = post.likes;
                        newLikes.splice(newLikes.indexOf(account.profileId), 1);

                        // Delete rooms and all related messages
                        prismaClient.post
                            .update({
                                where: {
                                    postId: post.postId,
                                },

                                data: {
                                    likes: {
                                        set: newLikes,
                                    },
                                },
                            })
                            .then(() => {
                                deletedLikes += 1;

                                if (deletedLikes == likesToDelete.length) {
                                    resolve();
                                }
                            });
                    }
                });
            }
        }

        if (pendingAccountRequests.length > 0) await updatePending();
        if (accountFriends.length > 0) await updateFriends();
        await deleteAccountData();
    } catch (e) {
        return generateError('UNKNOWN');
    }

    sendEmail(account.email, 'Goodbye and farewell!', [
        'Thank you for choosing Fronvo!',
        'Good luck in your future endeavours.',
    ]);

    return {};
}

const deleteAccountTemplate: EventTemplate = {
    func: deleteAccount,
    template: ['password'],
    schema: new StringSchema({
        ...passwordSchema,
    }),
};

export default deleteAccountTemplate;
