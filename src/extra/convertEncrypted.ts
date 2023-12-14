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

async function convertAll(): Promise<void> {
    await convertMessagesAES();
}

convertAll();
