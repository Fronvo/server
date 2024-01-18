// ******************** //
// The sendChannelImage account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { ChannelMessage } from '@prisma/client';
import { channelIdSchema, serverIdSchema } from 'events/shared';
import {
    SendChannelImageResult,
    SendChannelImageServerParams,
} from 'interfaces/account/sendChannelImage';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, sendMulticastFCM } from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function sendChannelImage({
    io,
    account,
    serverId,
    channelId,
    attachment,
}: SendChannelImageServerParams): Promise<
    SendChannelImageResult | FronvoError
> {
    const server = await prismaClient.server.findFirst({
        where: {
            serverId,
        },
    });

    if (!server) {
        return generateError('SERVER_404');
    }

    if (!server.members.includes(account.profileId)) {
        return generateError('NOT_IN_SERVER');
    }

    const channel = await prismaClient.channel.findFirst({
        where: {
            channelId,
        },
    });

    if (!channel) {
        return generateError('ROOM_404');
    }

    let newMessageData: Partial<ChannelMessage>;

    try {
        newMessageData = await prismaClient.channelMessage.create({
            data: {
                ownerId: account.profileId,
                channelId,
                messageId: v4(),
                isImage: true,
                attachment,
            },

            select: {
                ownerId: true,
                channelId: true,
                content: true,
                creationDate: true,
                messageId: true,
                isReply: true,
                replyContent: true,
                isImage: true,
                attachment: true,
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    io.to(channelId).emit('newMessage', {
        roomId: channelId,
        newMessageData: {
            message: newMessageData,
            profileData: account,
        },
    });

    try {
        sendMulticastFCM(
            server.members as string[],
            `@${account.profileId}`,
            `${account.username} sent an image`,
            account.profileId,
            true
        );
    } catch (e) {
        return generateError('UNKNOWN');
    }

    return {};
}

const sendChannelImageTemplate: EventTemplate = {
    func: sendChannelImage,
    template: ['serverId', 'channelId', 'attachment'],
    schema: new StringSchema({
        ...serverIdSchema,
        ...channelIdSchema,

        attachment: {
            // Ensure https
            regex: /https:\/\/ik.imagekit.io\/fronvo(2)?\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/,
        },
    }),
};

export default sendChannelImageTemplate;
