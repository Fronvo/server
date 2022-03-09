// ******************** //
// The fetchProfileData account-only event file.
// ******************** //

const utilities = require('../../other/utilities');

async function fetchProfileData({ socket, profileId }) {
    const accounts = await utilities.listDocuments('accounts');
    
    for(const account in accounts) {
        // If target account id isn't what were looking for, move on
        if(utilities.getAccountId(accounts, account) != profileId) continue;

        const accountData = utilities.getAccountData(accounts, account);

        // Dont spread the dictionary, only provide select info
        const finalAccountDict = {
            username: accountData.username,
            creationDate: accountData.creationDate
        }

        // If it's the user's profile, provide more details (better than having 2 seperate events)
        if(profileId == utilities.getLoggedInSockets()[socket.id]) {
            finalAccountDict.email = accountData.email;
        }

        return {profileData: finalAccountDict};
    }

    return utilities.generateError(errors.ERR_PROFILE_NOT_FOUND, enums.ERR_PROFILE_NOT_FOUND);
}

module.exports = fetchProfileData;
