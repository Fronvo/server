const variables = require('../other/variables');
const { accountSchema } = require('./schemas');
const { v4 } = require('uuid');

// here to be used by this file, too
function insertLog(mdb, logText) {
    const logDict = {};
    logDict['timestamp'] = new Date();
    logDict['info'] = logText;

    mdb.collection('logs').insertOne(logDict).catch(() => {});
}

async function listDocuments(mdb, collName) {
    return await mdb.collection(collName).find({}).toArray();
}

// internal use
async function createToken(mdb, accountId) {
    const tokenDict = {};
    const token = v4();
    
    tokenDict[token] = {accountId: Number(accountId)};

    await mdb.collection('tokens').insertOne(tokenDict);

    return token;
}

module.exports = {
    generateId: () => {
        // 8 digits
        return Math.floor(10000000 + Math.random() * 90000000);
    },

    insertLog: insertLog,

    getMinMaxEntriesForAccounts: () => {
        let resultDict = {email: {}, password: {}};

        for(const [key, value] of accountSchema._ids._byKey.entries()) {
            if(!(key === 'email' || key === 'password')) continue;

            for(const [_, value2] of value.schema._singleRules.entries()) {
                if(!(value2.name === 'min' || value2.name === 'max')) continue;

                resultDict[key][value2.name] = value2.args.limit;
            }
        };

        return resultDict;
    },

    loginSocket: async (socket, mdb, accountId) => {
        const tokens = await listDocuments(mdb, 'tokens');

        let accountFound = false;
        let finalAccountToken;

        tokens.forEach((token) => {
            delete token._id;
            
            const accountToken = Object.keys(token)[0];

            if(token[accountToken]['accountId'] === Number(accountId)) {
                accountFound = true;
                finalAccountToken = accountToken;
            }
        });

        // for accounts created before the new token system
        if(!accountFound) finalAccountToken = await createToken(mdb, accountId);

        variables.loggedInSockets[socket.id] = {accountId: accountId};

        return finalAccountToken;
    },

    logoutSocket: (socket) => {
        delete variables.loggedInSockets[socket.id];
    },

    isSocketLoggedIn: (socket) => {
        return socket.id in variables.loggedInSockets;
    },

    getLoggedInSockets: () => {
        return variables.loggedInSockets;
    },

    listDocuments: listDocuments
}
