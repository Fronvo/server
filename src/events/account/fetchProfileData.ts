// ******************** //
// The fetchProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { AccountData } from '@prisma/client';
import {
    FetchedFronvoAccount,
    FetchProfileDataResult,
    FetchProfileDataServerParams,
} from 'interfaces/account/fetchProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    findDocuments,
    generateError,
    getSocketAccountId,
} from 'utilities/global';

async function fetchProfileData({
    socket,
    profileId,
}: FetchProfileDataServerParams): Promise<
    FetchProfileDataResult | FronvoError
> {
    const accounts: { accountData: AccountData }[] = await findDocuments(
        'Account',
        { select: { accountData: true } }
    );

    for (const account in accounts) {
        const accountData = accounts[account].accountData;

        // Ensure this is the account we're looking for
        if (accountData.id != profileId) continue;

        // Handpick returned profile data
        const finalAccountData: FetchedFronvoAccount = {
            id: accountData.id,
            username: accountData.username,
            bio: accountData.bio || '',
            avatar: accountData.avatar || '',
            creationDate: accountData.creationDate,
            following: accountData.following || [],
            followers: accountData.following || [],
            posts: accountData.posts || [],
            isSelf: profileId == getSocketAccountId(socket.id),
        };

        // If self profile provide extra info
        if (finalAccountData.isSelf) {
            finalAccountData.email = accountData.email;
        }

        return {
            profileData: finalAccountData,
        };
    }

    return generateError('PROFILE_NOT_FOUND');
}

const fetchProfileDataTemplate: EventTemplate = {
    func: fetchProfileData,
    template: ['profileId'],
    points: 3,
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9]+$/,
        },
    }),
};

export default fetchProfileDataTemplate;
