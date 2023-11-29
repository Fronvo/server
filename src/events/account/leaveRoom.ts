// ******************** //
// The leaveRoom account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { roomIdSchema } from 'events/shared';
import {
    LeaveRoomResult,
    LeaveRoomServerParams,
} from 'interfaces/account/leaveRoom';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    deleteImage,
    generateError,
    sendRoomNotification,
} from 'utilities/global';
import { prismaClient } from 'variables/global';

async function leaveRoom({
    io,
    socket,
    account,
    roomId,
}: LeaveRoomServerParams): Promise<LeaveRoomResult | FronvoError> {
    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    if (!room) {
        return generateError('ROOM_404');
    }

    if (!room.members.includes(account.profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    // Leave / delete the room
    if (account.profileId == room.ownerId) {
        try {
            const deletedMessages = await prismaClient.message.findMany({
                where: {
                    roomId,
                },
            });

            await prismaClient.message.deleteMany({
                where: {
                    roomId,
                },
            });

            for (const messageIndex in deletedMessages) {
                const message = deletedMessages[messageIndex];

                deleteImage(message.attachment);
            }

            // Then, delete the room
            await prismaClient.room.delete({
                where: {
                    roomId,
                },
            });
        } catch (e) {
            return generateError('UNKNOWN');
        }

        io.to(room.roomId).emit('roomDeleted', {
            roomId,
        });

        // Clear room
        io.socketsLeave(room.roomId);

        deleteImage(room.icon);
    } else {
        // Set in-place
        const newMembers = room.members;

        // Remove current member
        newMembers.splice(newMembers.indexOf(account.profileId), 1);

        try {
            await prismaClient.room.update({
                where: {
                    roomId,
                },

                data: {
                    members: newMembers,
                },
            });
        } catch (e) {
            return generateError('UNKNOWN');
        }

        // Remove socket from room room
        await socket.leave(room.roomId);

        // Member left, update members
        io.to(roomId).emit('memberLeft', {
            roomId,
            profileId: account.profileId,
        });

        sendRoomNotification(io, room, `${account.profileId} left the room`);

        // Update seen states
        const newSeenStates = account.seenStates as {};

        if (newSeenStates) {
            if (roomId in newSeenStates) {
                delete newSeenStates[roomId];

                try {
                    await prismaClient.account.update({
                        where: {
                            profileId: account.profileId,
                        },

                        data: {
                            seenStates: newSeenStates,
                        },
                    });
                } catch (e) {
                    return generateError('UNKNOWN');
                }
            }
        }
    }

    return {};
}

const leaveRoomTemplate: EventTemplate = {
    func: leaveRoom,
    template: ['roomId'],
    schema: new StringSchema({
        ...roomIdSchema,
    }),
};

export default leaveRoomTemplate;
