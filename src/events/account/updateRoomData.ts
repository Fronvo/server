// ******************** //
// The updateRoomData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { roomIdOptionalSchema, roomNameOptionalSchema } from 'events/shared';
import {
    UpdateRoomDataResult,
    UpdateRoomDataServerParams,
} from 'interfaces/account/updateRoomData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function updateRoomData({
    io,
    socket,
    roomId,
    name,
    description,
    icon,
}: UpdateRoomDataServerParams): Promise<UpdateRoomDataResult | FronvoError> {
    // If none provided, return immediately
    if (
        !roomId &&
        !name &&
        !description &&
        description != '' &&
        !icon &&
        icon != ''
    ) {
        return {
            err: undefined,
        };
    }

    // Name validation not needed here, see schema below
    // Nor icon, may need for content-type and extension if applicable (|| ?)

    // Check room id availability
    if (roomId) {
        const roomIdData = await prismaClient.room.findFirst({
            where: {
                roomId,
            },
        });

        if (roomIdData) {
            return generateError('INVALID_ID');
        }
    }

    // Fetch old room id
    const accountData = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        select: {
            roomId: true,
        },
    });

    const previousRoom = await prismaClient.room.findFirst({
        where: {
            roomId: accountData.roomId,
        },
    });

    const roomData = await prismaClient.room.update({
        data: {
            roomId,
            name,
            icon,
        },

        where: {
            roomId: previousRoom.roomId,
        },

        select: {
            roomId: true,
            name: true,
            icon: true,
        },
    });

    if (roomId) {
        // Update related entries

        // Update accounts
        await prismaClient.account.updateMany({
            where: {
                roomId: previousRoom.roomId,
            },

            data: {
                roomId,
            },
        });

        // Update messages
        await prismaClient.roomMessage.updateMany({
            where: {
                roomId: previousRoom.roomId,
            },

            data: {
                roomId,
            },
        });
    }

    return { roomData };
}

const updateRoomDataTemplate: EventTemplate = {
    func: updateRoomData,
    template: ['roomId', 'name', 'icon'],
    schema: new StringSchema({
        ...roomIdOptionalSchema,

        ...roomNameOptionalSchema,

        icon: {
            // Ensure https
            regex: /^(https:\/\/).+$/,
            maxLength: 512,
            optional: true,
        },
    }),
};

export default updateRoomDataTemplate;
