// ******************** //
// The updateRoomData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    roomIconSchema,
    roomIdSchema,
    roomNameOptionalSchema,
} from 'events/shared';
import {
    UpdateRoomDataResult,
    UpdateRoomDataServerParams,
} from 'interfaces/account/updateRoomData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    decryptAES,
    deleteImage,
    encryptAES,
    generateError,
    sendRoomNotification,
} from 'utilities/global';
import { prismaClient } from 'variables/global';

async function updateRoomData({
    io,
    account,
    roomId,
    name,
    icon,
}: UpdateRoomDataServerParams): Promise<UpdateRoomDataResult | FronvoError> {
    // Name validation not needed here, see schema below
    const room = await prismaClient.room.findFirst({
        where: {
            roomId,
        },
    });

    let nameGiven = name;

    if (!room) {
        return generateError('ROOM_404');
    }

    // Check if we are in the room, not necessary to be the owner
    if (!room.members.includes(account.profileId)) {
        return generateError('NOT_IN_ROOM');
    }

    // Ensure name is not empty
    if (!name) {
        name = decryptAES(room.name);
    }

    try {
        await prismaClient.room.update({
            where: {
                roomId,
            },

            data: {
                name: encryptAES(name),
                icon,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    io.to(roomId).emit('roomDataUpdated', {
        roomId,
        name: name ? name : decryptAES(room.name),
        icon: icon ? icon : room.icon,
    });

    if (icon?.length > 0) {
        deleteImage(room.icon);
    }

    if (nameGiven) {
        if (name?.length > 0) {
            sendRoomNotification(
                io,
                {
                    ...room,
                    name: name ? name : decryptAES(room.name),
                    icon: icon ? icon : room.icon,
                },
                `${account.profileId} changed the room name to ${name}`
            );
        }
    }

    if (icon?.length > 0) {
        sendRoomNotification(
            io,
            {
                ...room,
                name: name ? name : decryptAES(room.name),
                icon: icon ? icon : room.icon,
            },
            `${account.profileId} changed the room icon`
        );
    }

    return {};
}

const updateRoomDataTemplate: EventTemplate = {
    func: updateRoomData,
    template: ['roomId', 'name', 'icon'],
    schema: new StringSchema({
        ...roomIdSchema,
        ...roomNameOptionalSchema,
        ...roomIconSchema,
    }),
};

export default updateRoomDataTemplate;
