// ******************** //
// Events which are only usable while logged in.
// ******************** //

const { enums } = require('../other/enums');
const errors = require('../other/errors');
const utilities = require('../other/utilities');
const { format } = require('util');

module.exports = {
    fetchProfileId: (io, socket, mdb) => {
        // According to variables.js comment on loggedInSockets fill method
        return utilities.getLoggedInSockets()[socket.id];
    },

    fetchProfileData: async ({socket, mdb}, profileId) => {
        // TODO: Move to the if statement, will return null if logged out so who cares
        const loggedInSockets = utilities.getLoggedInSockets();

        const accounts = await utilities.listDocuments(mdb, 'accounts');
        
        for(let account in accounts) {
            account = accounts[account];

            const accountId = Object.keys(account)[1];

            // If target account id isn't what were looking for, move on
            if(accountId != profileId) continue;

            const accountDict = account[accountId];

            // Dont spread the dictionary, only provide select info
            const finalAccountDict = {
                username: accountDict.username,
                creationDate: accountDict.creationDate
            }

            // If it's the user's profile, provide more details (better than having 2 seperate events)
            if(profileId == loggedInSockets[socket.id]) {
                finalAccountDict.email = accountDict.email;
            }

            return [null, finalAccountDict];
        }

        return {msg: format(errors.ERR_PROFILE_NOT_FOUND, profileId), code: enums.ERR_PROFILE_NOT_FOUND};
    }
}
