// ******************** //
// The fetchProfileData account-only event file.
// ******************** //

import { FetchProfileDataResult, FetchProfileDataServerParams } from 'interfaces/account/fetchProfileData';
import { Account, FronvoError } from 'interfaces/all';
import { enums } from 'other/enums';
import { ERR_PROFILE_NOT_FOUND } from 'other/errors';
import { generateError, getAccountData, getAccountId, getLoggedInSockets, listDocuments } from 'other/utilities';

export default async ({ socket, profileId }: FetchProfileDataServerParams): Promise<FetchProfileDataResult | FronvoError> => {
    const accounts: Account[] = await listDocuments('accounts');
    
    for(const account in accounts) {
        // If target account id isn't what were looking for, move on
        if(getAccountId(accounts, account) != profileId) continue;

        const accountData: Account = getAccountData(accounts, account);

        // Dont spread the dictionary, only provide select info
        const finalAccountDict: Partial<Account> = {
            username: accountData.username,
            creationDate: accountData.creationDate
        }

        // If it's the user's profile, provide more details (better than having 2 seperate events)
        if(profileId == getLoggedInSockets()[socket.id].accountId) {
            finalAccountDict.email = accountData.email;
        }

        return {profileData: finalAccountDict};
    }

    return generateError(ERR_PROFILE_NOT_FOUND, enums.ERR_PROFILE_NOT_FOUND);
}
