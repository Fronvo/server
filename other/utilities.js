// ******************** //
// Reusable functions to avoid repetition.
// ******************** //

const variables = require('../other/variables');
const errors = require('../other/errors');
const { localDB } = require('../other/variables');
const { v4 } = require('uuid');
const { writeFile } = require('fs');

function saveLocalDB() {
    if(!variables.localMode || !variables.localSave) return;

    // Asynchronous write, boosts local development even more
    writeFile(variables.localDBPath, JSON.stringify(variables.localDB, null, '\t'), (err) => {
        if(err) {
            console.log(errors.ERR_LOCAL_DB_FAIL);
        }
    });
}

async function insertToCollection(mdb, collName, dict) {
    if(!variables.localMode) {
        await mdb.collection(collName).insertOne(dict).catch(() => {});

    } else {
        // Loop and find if a dictionary with the same root key exists
        for(let dictItem in localDB[collName]) {
            const dictItemIndex = dictItem;
            dictItem = localDB[collName][dictItem];
            const dictItemRootKey = Object.keys(dictItem)[0];

            if(dictItemRootKey == Object.keys(dict)[0]) {
                // Found the one
                // Use dictionary spreading, create new keys and overwrite older ones
                localDB[collName][dictItemIndex][dictItemRootKey] = {...dictItem[dictItemRootKey], ...dict};
                saveLocalDB();
                // Dont fallback
                return;
            }
        }

        // Fallback, create a new key
        localDB[collName].push(dict);
        saveLocalDB();
    }
}

function insertLog(mdb, logText) {
    const logDict = {};
    logDict[v4()] = {timestamp: new Date(), info: logText};

    insertToCollection(mdb, 'logs', logDict);
}

function insertTextToCollection(mdb, collName, text) {
    const dictToInsert = {};
    dictToInsert[v4()] = {timestamp: new Date(), text};

    insertToCollection(mdb, collName, dictToInsert);
}

async function listDocuments(mdb, collName) {
    if(!variables.localMode) {
        return await mdb.collection(collName).find({}).toArray();

    } else {
        return localDB[collName];
    }
}

function getTokenAccountId(tokensArray, tokenIndex) {
    return Object.keys(tokensArray[tokenIndex])[variables.localMode ? 0 : 1];
}

function getTokenKey(tokensArray, tokenIndex) {
    const tokenAccountId = getTokenAccountId(tokensArray, tokenIndex);
    
    return tokensArray[tokenIndex][tokenAccountId];
}

module.exports = {
    convertToId: (username) => {
        // 'Fronvo user 1' => 'fronvouser1'
        return username.replace(/ /g, '').toLowerCase();
    },

    insertLog,

    insertToCollection,

    loginSocket: (io, socket, accountId) => {
        variables.loggedInSockets[socket.id] = accountId;

        // Update other servers in cluster mode
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

        await insertToCollection(mdb, 'tokens', tokenDict);
    
        return token;
    },

    getToken: async (mdb, accountId) => {
        const tokens = await listDocuments(mdb, 'tokens');

        for(let token in tokens) {
            if(accountId === getTokenAccountId(tokens, token)) {
                return getTokenKey(tokens, token);
            }
        }
    },
    
    isSocketLoggedIn: (socket) => {
        return socket.id in variables.loggedInSockets;
    },

    getLoggedInSockets: () => {
        return variables.loggedInSockets;
    },

    listDocuments,

    perfStart: (perfName) => {
        if(!variables.performanceReportsEnabled) return;

        // Mantain uniqueness regardless of perfName
        const perfUUID = v4();

        variables.performanceReports[perfUUID] = {
            perfName: perfName,
            timestamp: new Date()
        };

        // Return it for perfEnd
        return perfUUID;
    },

    perfEnd: (mdb, perfUUID) => {
        if(!variables.performanceReportsEnabled || !perfUUID in variables.performanceReports) return;

        // Basically copy the dictionary
        const perfReportDict = variables.performanceReports[perfUUID];

        const msDuration = new Date() - perfReportDict.timestamp;

        // Check if it passes the min report MS duration (optional)
        if(msDuration >= variables.performanceReportsMinMS) {
            insertTextToCollection(mdb, 'reports', perfReportDict.perfName + ' took ' + msDuration + 'ms.');
        }

        // Delete to save memory
        delete variables.performanceReports[perfUUID];
    },
    
    getEmailDomain: (email) => {
        // Will fail Joi schema checks if the email doesnt comply with this format
        return email.split('@')[1];
    },

    getAccountData: (accountsArray, accountIndex) => {
        // Empty check
        if(variables.localMode) {
            if(Object.keys(accountsArray[0]).length == 0) return {};
        }

        const accountDictionary = accountsArray[accountIndex];

        return accountDictionary[Object.keys(accountDictionary)[variables.localMode ? 0 : 1]];
    },

    getAccountId: (accountsArray, accountIndex) => {
        return Object.keys(accountsArray[accountIndex])[variables.localMode ? 0 : 1];
    },

    getTokenKey,

    getTokenAccountId,

    // Duplicate of variables.js function to prevent recursive import errors
    decideBooleanEnvValue: (value, valueIfNull) => {
        return value == null ? valueIfNull : (value.toLowerCase() == 'true' ? true : false);
    }
}
