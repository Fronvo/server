const utilities = require("../other/utilities");

module.exports = {
    fetchProfileData: async (io, socket, mdb) => {
        const accounts = await utilities.listDocuments(mdb, 'accounts');

        const loggedInSockets = utilities.getLoggedInSockets();

        for(let account in accounts) {
            account = accounts[account];

            const accountId = Object.keys(account)[1];

            // compare account id with connected & logged in socket's account id
            if(accountId == loggedInSockets[socket.id]['accountId']) {
                let accountDict = account[accountId];

                // no.
                delete accountDict.password;

                return accountDict;
            }
        }
    }
}
