import { decryptAES } from 'utilities/global';
import * as variables from 'variables/global';

async function checkPostsAES(): Promise<void> {
    let corruptedPosts = 0;

    const posts = await variables.prismaClient.post.findMany({
        select: {
            content: true,
        },
    });

    for (const postIndex in posts) {
        const target = posts[postIndex];

        let contentRes: string;

        if (target.content) {
            contentRes = decryptAES(target.content);
        }

        if (contentRes == 'CORRUPTED') {
            corruptedPosts += 1;
        }
    }

    console.log(`Corrupted posts: ${corruptedPosts}/${posts.length}`);
}

async function checkMessagesAES(): Promise<void> {
    let corruptedMessages = 0;

    const messages = await variables.prismaClient.roomMessage.findMany({
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

    console.log(`Corrupted messages: ${corruptedMessages}/${messages.length}`);
}

checkMessagesAES();
checkPostsAES();
