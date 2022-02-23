// ******************** //
// Events which are only usable while logged in.
// ******************** //

const { enums } = require('../other/enums');
const errors = require('../other/errors');
const utilities = require('../other/utilities');
const { getAccountData, getAccountId } = require('../other/utilities');
const { format } = require('util');

function fetchProfileId(io, socket, mdb) {
    // According to variables.js comment on loggedInSockets fill method
    return utilities.getLoggedInSockets()[socket.id];
}

async function fetchProfileData(io, socket, mdb, profileId) {
    const accounts = await utilities.listDocuments(mdb, 'accounts');
    
    for(let account in accounts) {
        // If target account id isn't what were looking for, move on
        if(getAccountId(accounts, account) != profileId) continue;

        const accountData = getAccountData(accounts, account);

        // Dont spread the dictionary, only provide select info
        const finalAccountDict = {
            username: accountData.username,
            creationDate: accountData.creationDate
        }

        // If it's the user's profile, provide more details (better than having 2 seperate events)
        if(profileId == utilities.getLoggedInSockets()[socket.id]) {
            finalAccountDict.email = accountData.email;
        }

        return [null, finalAccountDict];
    }

    return {msg: format(errors.ERR_PROFILE_NOT_FOUND, profileId), code: enums.ERR_PROFILE_NOT_FOUND};
}

module.exports = { fetchProfileId, fetchProfileData }
