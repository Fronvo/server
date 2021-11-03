const variables = require('../other/variables');
const { accountSchema } = require('./schemas');
const { v4 } = require('uuid');

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

    registerAccount: (mdb, accountDict) => {
        return new Promise((resolve, reject) => {
            const accountId = Object.keys(accountDict)[0];

            mdb.collection('accounts').insertOne(accountDict)
            .then(() => {
                const tokenDict = {};
                const token = v4();
    
                tokenDict[token] = {accountId: accountId};
    
                mdb.collection('tokens').insertOne(tokenDict)
                .then(() => {
                    resolve(token);
                    console.log('Registered user: ', accountDict[accountId].username);
                });
            });
        });
    },

    loginSocket: (socket, mdb, accountId) => {
        return new Promise((resolve, reject) => {
            mdb.collection('tokens').find({}).toArray((err, keys) => {
                let accountFound = false;

                keys.forEach((key) => {
                    delete key._id;
                    
                    if(key[Object.keys(key)[0]]['accountId'] === accountId) {
                        accountFound = true;
                        variables.loggedInSockets[socket.id] = {accountId: accountId};
                        resolve(Object.keys(key)[0]);

                        console.log('Socket ' + socket.id + ' has logged in.');
                    }
                });

                // for accounts created before the new token system
                if(!accountFound) {
                    const tokenDict = {};
                    const token = v4();
        
                    tokenDict[token] = {accountId: accountId};
        
                    mdb.collection('tokens').insertOne(tokenDict)
                    .then(() => {
                        variables.loggedInSockets[socket.id] = {accountId: accountId};
                        resolve(token);

                        console.log('Socket ' + socket.id + ' has logged in.');
                    });
                }
            });
        });
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
