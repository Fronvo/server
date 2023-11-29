import { encryptAES } from 'utilities/global';
import * as variables from 'variables/global';

async function convertMessagesAES(): Promise<void> {
    const roomIds = await variables.prismaClient.message.findMany({
        select: {
            messageId: true,
            content: true,
            replyContent: true,
        },

        where: {
            ownerId: 'shadofer',
        },

        skip: 3500,
        take: 1000,
    });

    for (const roomIndex in roomIds) {
        const target = roomIds[roomIndex];

        variables.prismaClient.message
            .update({
                where: {
                    messageId: target.messageId,
                },

                data: {
                    content: encryptAES(target.content),
                    replyContent: encryptAES(target.replyContent),
                },
            })
            .then(() => {});
    }
}

async function convertRoomsAES(): Promise<void> {
    const roomIds = await variables.prismaClient.room.findMany({
        select: {
            roomId: true,
            name: true,
            isDM: true,
        },
    });

    for (const roomIndex in roomIds) {
        const target = roomIds[roomIndex];

        if (target.isDM) continue;

        variables.prismaClient.room
            .update({
                where: {
                    roomId: target.roomId,
                },

                data: {
                    name: encryptAES(target.name),
                },
            })
            .then(() => {});
    }
}

async function convertPostsAES(): Promise<void> {
    const roomIds = await variables.prismaClient.post.findMany({
        select: {
            postId: true,
            content: true,
        },
    });

    for (const roomIndex in roomIds) {
        const target = roomIds[roomIndex];

        variables.prismaClient.post
            .update({
                where: {
                    postId: target.postId,
                },

                data: {
                    content: encryptAES(target.content),
                },
            })
            .then(() => {});
    }
}

async function convertAll(): Promise<void> {
    await convertRoomsAES();
    await convertPostsAES();
    await convertMessagesAES();
}

convertAll();
