// The file preceding any tests, for setup checks.

import { prismaClient } from 'variables/global';

async function checkOfficialAccount(): Promise<void> {
    const officialAccount = await prismaClient.account.findFirst({
        where: {
            profileId: 'fronvo',
        },
    });

    if (!officialAccount) {
        // Warn if it doesnt exist
        console.log(`Run \'npm run setup\' before \'npm test\'!`);
        process.exit(1);
    }
}

async function checkOfficialCommunity(): Promise<void> {
    const officialCommunity = await prismaClient.community.findFirst({
        where: {
            communityId: 'fronvo',
        },
    });

    if (!officialCommunity) {
        // Warn if it doesnt exist
        console.log(`Run \'npm run setup\' before \'npm test\'!`);
        process.exit(1);
    }
}

export default async function preTests(): Promise<void> {
    await checkOfficialAccount();
    await checkOfficialCommunity();
}
