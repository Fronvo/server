import { encryptAES } from 'utilities/global';
import * as variables from 'variables/global';

async function convertMessagesAES(): Promise<void> {
    const roomIds = await variables.prismaClient.message.findMany({
        select: {
            messageId: true,
            content: true,
        },

        where: {
            ownerId: 'shadofer',
        },
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
                },
            })
            .then(() => {});
    }
}

async function convertAll(): Promise<void> {
    await convertMessagesAES();
}

convertAll();
