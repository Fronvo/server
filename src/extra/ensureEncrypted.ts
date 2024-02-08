import { decryptAES } from 'utilities/global';
import * as variables from 'variables/global';

async function checkMessagesAES(): Promise<void> {
    let corruptedMessages = 0;

    const messages = await variables.prismaClient.message.findMany({
        select: {
            content: true,
            replyContent: true,
        },
    });

    const channelMessages =
        await variables.prismaClient.channelMessage.findMany({
            select: {
                content: true,
                replyContent: true,
            },
        });

    for (const messageIndex in messages) {
        const target = messages[messageIndex];

        let contentRes: string;
        let replyContentRes: string;

        if (target.content) {
            contentRes = decryptAES(target.content);
        }

        if (target.replyContent) {
            replyContentRes = decryptAES(target.replyContent);
        }

        if (contentRes == 'CORRUPTED' || replyContentRes == 'CORRUPTED') {
            corruptedMessages += 1;
        }
    }

    for (const messageIndex in channelMessages) {
        const target = messages[messageIndex];

        let contentRes: string;
        let replyContentRes: string;

        if (target.content) {
            contentRes = decryptAES(target.content);
        }

        if (target.replyContent) {
            replyContentRes = decryptAES(target.replyContent);
        }

        if (contentRes == 'CORRUPTED' || replyContentRes == 'CORRUPTED') {
            corruptedMessages += 1;
        }
    }

    console.log(
        `Corrupted messages: ${corruptedMessages}/${
            messages.length + channelMessages.length
        }`
    );
}

checkMessagesAES();
