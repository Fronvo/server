// ******************** //
// Reusable functions to avoid repetition.
// ******************** //

import { writeFile } from 'fs';
import { Server, Socket } from 'socket.io';
import { v4 } from 'uuid';
import * as errors from './errors';
import { Account, ClientToServerEvents, Error, InterServerEvents, LoggedInSocket, ServerToClientEvents, Token } from './interfaces';
import * as variables from './variables';
// Dont import mdb explicitly, wont update with the passed client
import { localDB } from './variables';

export function saveLocalDB(): void {
    if(!variables.localMode || !variables.localSave) return;

    // Asynchronous write, boosts local development even more
    writeFile(variables.localDBPath, JSON.stringify(localDB, null, '\t'), (err) => {
        if(err) {
            console.log(errors.ERR_LOCAL_DB_FAIL);
        }
    });
}

export async function insertToCollection(collName: string, dict: {[key: string]: any}): Promise<void> {
    if(!variables.localMode) {
        await variables.mdb.collection(collName).insertOne(dict).catch(() => {});

    } else {
        // Loop and find if a dictionary with the same root key exists
        for(let dictItem in localDB[collName]) {
            const dictItemIndex = dictItem;
            const dictItemPlaceholder = localDB[collName][dictItem];
            const dictItemRootKey = Object.keys(dictItemPlaceholder)[0];

            if(dictItemRootKey == Object.keys(dict)[0]) {
                // Found the one
                // Use dictionary spreading, create new keys and overwrite older ones
                localDB[collName][dictItemIndex][dictItemRootKey] = {...dictItemPlaceholder[dictItemRootKey], ...dict};
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

export function insertLog(logText: string): void {
    const logDict = {};
    logDict[v4()] = {timestamp: new Date(), info: logText};

    insertToCollection('logs', logDict);
}

export function insertTextToCollection(collName: string, text: string): void {
    const dictToInsert = {};
    dictToInsert[v4()] = {timestamp: new Date(), text};

    insertToCollection(collName, dictToInsert);
}

export async function listDocuments(collName: string): Promise<any[]> {
    if(!variables.localMode) {
        return await variables.mdb.collection(collName).find({}).toArray();

    } else {
        return localDB[collName];
    }
}

export function getTokenAccountId(tokensArray: Token[], tokenIndex: string): string {
    return Object.keys(tokensArray[tokenIndex])[variables.localMode ? 0 : 1];
}

export function getTokenKey(tokensArray: Token[], tokenIndex: string): string {
    const tokenAccountId = getTokenAccountId(tokensArray, tokenIndex);
    
    return tokensArray[tokenIndex][tokenAccountId];
}

export function convertToId(username: string): string {
    // 'Fronvo user 1' => 'fronvouser1'
    return username.replace(/ /g, '').toLowerCase();
};

export function loginSocket(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>, socket: Socket<ClientToServerEvents, ServerToClientEvents>, accountId: string): void {
    variables.loggedInSockets[socket.id] = {accountId};

    // Update other servers in cluster mode
    if(variables.cluster) io.serverSideEmit('loginSocket', socket.id, accountId);
};

export function logoutSocket(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>, socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
    delete variables.loggedInSockets[socket.id];
    
    if(variables.cluster) io.serverSideEmit('logoutSocket', socket.id);
};

export async function createToken(accountId: string): Promise<string> {
    const tokenDict = {};
    const token = v4();
    tokenDict[accountId] = token;

    await insertToCollection('tokens', tokenDict);

    return token;
};

export async function getToken(accountId: string): Promise<string> {
    const tokens = await listDocuments('tokens');

    for(const token in tokens) {
        if(accountId === getTokenAccountId(tokens, token)) {
            return getTokenKey(tokens, token);
        }
    }
};

export function isSocketLoggedIn(socket: Socket<ClientToServerEvents, ServerToClientEvents>): boolean {
    return socket.id in variables.loggedInSockets;
};

export function getLoggedInSockets(): {[socketId: string]: LoggedInSocket} {
    return variables.loggedInSockets;
};

export function perfStart(perfName: string): string {
    if(!variables.performanceReportsEnabled) return;

    // Mantain uniqueness regardless of perfName
    const perfUUID = v4();

    variables.performanceReports[perfUUID] = {
        perfName: perfName,
        timestamp: new Date()
    };

    // Return it for perfEnd
    return perfUUID;
};

export function perfEnd(perfUUID: string): void {
    if(!variables.performanceReportsEnabled || !(perfUUID in variables.performanceReports)) return;

    // Basically copy the dictionary
    const perfReportDict = variables.performanceReports[perfUUID];

    const msDuration = new Date().getMilliseconds() - perfReportDict.timestamp.getMilliseconds();

    // Check if it passes the min report MS duration (optional)
    if(msDuration >= variables.performanceReportsMinMS) {
        insertTextToCollection('reports', perfReportDict.perfName + ' took ' + msDuration + 'ms.');
    }

    // Delete to save memory
    delete variables.performanceReports[perfUUID];
};

export function getEmailDomain(email: string): string {
    // Will fail Joi schema checks if the email doesnt comply with this format
    return email.split('@')[1];
};

export function getAccountData(accountsArray: Account[], accountIndex: string): Account {
    const accountDictionary = accountsArray[accountIndex];

    return accountDictionary[Object.keys(accountDictionary)[variables.localMode ? 0 : 1]];
};

export function getAccountId(accountsArray: Account[], accountIndex: string): string {
    return Object.keys(accountsArray[accountIndex])[variables.localMode ? 0 : 1];
};

// Duplicate of variables.js function to prevent recursive import errors
export function decideBooleanEnvValue(value: string, valueIfNull: boolean): boolean {
    return value == null ? valueIfNull : (value.toLowerCase() == 'true' ? true : false);
}

export function generateError(msg: string, code: number, extras?: {[key: string]: any}): Error {
    return {
        err: {
            msg,
            code,
            ...extras
        }
    };
}
