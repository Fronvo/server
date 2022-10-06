// The file ran after any tests, for db recovery.

import shared from 'test/shared';
import { prismaClient } from 'variables/global';

async function removeTestAccounts(): Promise<void> {
    await prismaClient.account.deleteMany({
        where: {
            OR: [
                {
                    profileId: shared.profileId,
                },
                {
                    profileId: shared.secondaryProfileId,
                },
            ],
        },
    });

    await prismaClient.token.deleteMany({
        where: {
            OR: [
                {
                    profileId: shared.profileId,
                },
                {
                    profileId: shared.secondaryProfileId,
                },
            ],
        },
    });
}

export default async function postTests(): Promise<void> {
    await removeTestAccounts();
}
