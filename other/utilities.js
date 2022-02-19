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

function insertTextToCollection(mdb, collName, text) {
    const dictToInsert = {};
    dictToInsert[v4()] = text;

    mdb.collection(collName).insertOne(dictToInsert).catch(() => {});
}

async function listDocuments(mdb, collName) {
    return await mdb.collection(collName).find({}).toArray();
}

module.exports = {
    convertToId: (username) => {
        // Fronvo user 1 => fronvouser1
        return username.replace(/ /g, '').toLowerCase();
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

    loginSocket: (io, socket, accountId) => {
        variables.loggedInSockets[socket.id] = accountId;

        if(variables.cluster) io.serverSideEmit('loginSocket', socket.id, accountId);
    },

    logoutSocket: (io, socket) => {
        delete variables.loggedInSockets[socket.id];
        
        if(variables.cluster) io.serverSideEmit('logoutSocket', socket.id);
    },

    createToken: async (mdb, accountId) => {
        const tokenDict = {};
        const token = v4();
        
        tokenDict[accountId] = token;
    
        await mdb.collection('tokens').insertOne(tokenDict);
    
        return token;
    },

    getToken: async (mdb, accountId) => {
        const tokens = await listDocuments(mdb, 'tokens');

        for(let token in tokens) {
            token = tokens[token];
            const tokenAccountId = Object.keys(token)[1];

            if(accountId === tokenAccountId) {
                return token[tokenAccountId];
            }
        }
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

        if(msDuration >= variables.performanceReportsMinMS) {
            insertTextToCollection(mdb, 'reports', perfReportDict.perfName + ' took ' + msDuration + 'ms.');
        }

        delete variables.performanceReports[perfUUID];
    },
    
    getEmailDomain: (email) => {
        return email.split('@')[1];
    }
}
