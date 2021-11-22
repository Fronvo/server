const variables = require('../other/variables');
const { accountSchema } = require('./schemas');
const { v4 } = require('uuid');
const bcrypt = require('bcrypt');

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
    
    tokenDict[Number(accountId)] = bcrypt.hashSync(token, variables.mainBcryptHash);

    await mdb.collection('tokens').insertOne(tokenDict);

    return token;
}

async function regenerateToken(mdb, accountId) {
    const tokens = await listDocuments(mdb, 'tokens');

    tokens.forEach(async token => {
        const tokenItemId = token._id;
        delete token._id;

        if(accountId === Object.keys(token)[0]) {
            await mdb.collection('tokens').deleteOne({_id: tokenItemId});
        }
    });

    return await createToken(mdb, accountId);
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

        tokens.forEach((token) => {
            delete token._id;
            
            const tokenAccountId = Object.keys(token)[0];

            if(tokenAccountId === accountId) {
                accountFound = true;
            }
        });

        let finalAccountToken;

        // regenerate token if found, otherwise create it (cant decrypt current one)
        if(!accountFound) finalAccountToken = await createToken(mdb, accountId);
        else finalAccountToken = await regenerateToken(mdb, accountId);
        
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
