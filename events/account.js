const { enums } = require('../other/enums');
const errors = require('../other/errors');
const utilities = require('../other/utilities');
const { format } = require('util');

module.exports = {
    fetchProfileId: (io, socket, mdb) => {
        return utilities.getLoggedInSockets()[socket.id];
    },

    fetchProfileData: async (io, socket, mdb, profileId) => {
        const loggedInSockets = utilities.getLoggedInSockets();

        const accounts = await utilities.listDocuments(mdb, 'accounts');
        
        for(let account in accounts) {
            account = accounts[account];

            const accountId = Object.keys(account)[1];

            if(accountId != profileId) continue;

            const accountDict = account[accountId];

            const finalAccountDict = {
                username: accountDict.username,
                creationDate: accountDict.creationDate
            }

            // more info for personal profile
            if(profileId == loggedInSockets[socket.id]) {
                finalAccountDict.email = accountDict.email;
            }

            return [null, finalAccountDict];
        }

        return {msg: format(errors.ERR_PROFILE_NOT_FOUND, profileId), code: enums.ERR_PROFILE_NOT_FOUND};
    }
}
