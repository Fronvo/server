const variables = require('../other/variables');
const { accountSchema } = require('./schemas');

module.exports = {
    generateId: () => {
        // 8 digits
        return Math.floor(10000000 + Math.random() * 90000000);
    },

    getMinMaxEntriesForAccounts: () => {
        let resultDict = {email: {}, password: {}}

        for(const [key, value] of accountSchema._ids._byKey.entries()) {
            if(!(key === 'email' || key === 'password')) continue;

            for(const [_, value2] of value.schema._singleRules.entries()) {
                if(!(value2.name === 'min' || value2.name === 'max')) continue;

                resultDict[key][value2.name] = value2.args.limit;
            }
        };

        return resultDict;
    },

    loginSocket: (socket, accountDict) => {
        variables.loggedInSockets[socket.id] = {accountId: Object.keys(accountDict)[0]};
        console.log('Socket ' + socket.id + ' has logged in.');
    },

    logoutSocket: (socket) => {
        delete variables.loggedInSockets[socket.id];
        console.log('Socket ' + socket.id + ' has logged out.');
    },

    isSocketLoggedIn: (socket) => {
        return socket.id in variables.loggedInSockets;
    },

    getLoggedInSockets: () => {
        return variables.loggedInSockets;
    },
}
