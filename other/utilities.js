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

function insertTextToCollection(mdb, collName, text) {
    const dictToInsert = {};
    dictToInsert[v4()] = text;

    mdb.collection(collName).insertOne(dictToInsert).catch(() => {});
}

async function listDocuments(mdb, collName) {
    return await mdb.collection(collName).find({}).toArray();
}

// internal use
async function createToken(mdb, accountId) {
    const tokenDict = {};
    const token = v4();
    
    tokenDict[Number(accountId)] = bcrypt.hashSync(token, variables.secondaryBcryptHash);

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

    loginSocket: (socket, accountId) => {
        variables.loggedInSockets[socket.id] = {accountId: accountId}
    },

    logoutSocket: (socket) => {
        delete variables.loggedInSockets[socket.id];
    },

    createToken: createToken,

    regenerateToken: async (mdb, accountId) => {
        const tokens = await listDocuments(mdb, 'tokens');

        for(const token in tokens) {
            if(accountId === Object.keys(tokens[token])[0]) {
                await mdb.collection('tokens').deleteOne({_id: tokens[token][Object.keys(tokens[token])[1]]});
    
                return await createToken(mdb, accountId);
            }
        };
    },
    
    isSocketLoggedIn: (socket) => {
        return socket.id in variables.loggedInSockets;
    },

    getLoggedInSockets: () => {
        return variables.loggedInSockets;
    },

    listDocuments: listDocuments,

    perfStart: (perfName) => {
        if(!variables.performanceReportsEnabled) return;

        // mantain uniqueness, dont base it off solely the name
        const perfUUID = v4();

        variables.performanceReports[perfUUID] = {
            perfName: perfName,
            timestamp: new Date()
        };

        return perfUUID;
    },

    perfEnd: (mdb, perfUUID) => {
        if(!variables.performanceReportsEnabled || !perfUUID in variables.performanceReports) return;

        const perfReportDict = variables.performanceReports[perfUUID];
        const msDuration = new Date() - perfReportDict.timestamp;

        insertTextToCollection(mdb, 'reports', perfReportDict.perfName + ' took ' + msDuration + 'ms.');

        delete variables.performanceReports[perfUUID];
    }
}
