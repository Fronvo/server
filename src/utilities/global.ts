// ******************** //
// Reusable functions for all kinds of events to avoid repetition.
// ******************** //

import { LogData, Prisma, ReportData, TokenData } from '@prisma/client';
import { writeFile } from 'fs';
import { FronvoError, LoggedInSocket } from 'interfaces/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import * as errors from 'other/errors';
import * as variables from 'other/variables';
import { localDB, prismaClient } from 'other/variables';
import { Server, Socket } from 'socket.io';
import { v4 } from 'uuid';

export function saveLocalDB(): void {
    if(!variables.localMode || !variables.localSave) return;

    // Asynchronous write, boosts local development even more
    writeFile(variables.localDBPath, JSON.stringify(localDB, null, '\t'), (err) => {
        if(err) {
            console.log(errors.ERR_LOCAL_DB_FAIL);
        }
    });
}

export async function insertDocument(collName: 'Account' | 'Token' | 'Report' | 'Log', dict: {[key: string]: any}, recordId?: string): Promise<void> {
    if(!variables.localMode) {
        await prismaClient[collName].create({
            data: {...dict}
        });
    } else {
        // Loop and find if a dictionary with the same _id key exists, if recordId is provided
        if(recordId) {
            for(const dictIndex in localDB[collName]) {
                const dictItem: Partial<{_id: string}> = localDB[collName][dictIndex];

                // Overwrite
                if(dictItem._id == recordId) {
                    localDB[collName].splice(Number(dictIndex), Number(dictIndex) + 1);
                }
            }
        }

        // Fallback, create a new key

        // No recordId provided, anonymise record
        if(!recordId) dict._id = v4();
        else dict._id = recordId;

        localDB[collName].push(dict);

        saveLocalDB();
    }
}

export async function findDocuments(collName: 'Account' | 'Token' | 'Report' | 'Log', prismaFilter?: Partial<Prisma.SelectAndInclude>): Promise<any[]> {
    if(!variables.localMode) {
        return await prismaClient[collName].findMany(prismaFilter ? prismaFilter : {});
    } else {
        return localDB[collName];
    }
}

export function insertLog(info: string): void {
    const logData: LogData = {
        info,
        timestamp: new Date()
    };

    insertDocument('Log', {logData});
}

export function loginSocket(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>, socket: Socket<ClientToServerEvents, ServerToClientEvents>, accountId: string): void {
    variables.loggedInSockets[socket.id] = {accountId};

    // Update other servers in cluster mode
    if(variables.cluster) io.serverSideEmit('loginSocket', socket.id, accountId);
};

export function logoutSocket(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>, socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
    delete variables.loggedInSockets[socket.id];
    
    if(variables.cluster) io.serverSideEmit('logoutSocket', socket.id);
};

export function isSocketLoggedIn(socket: Socket<ClientToServerEvents, ServerToClientEvents>): boolean {
    return socket.id in variables.loggedInSockets;
};

export function getLoggedInSockets(): {[socketId: string]: LoggedInSocket} {
    return variables.loggedInSockets;
};

export function reportStart(reportName: string): string {
    if(!variables.performanceReportsEnabled) return;

    // Mantain uniqueness regardless of reportName
    const reportUUID = v4();

    variables.performanceReports[reportUUID] = {
        reportName,
        timestamp: new Date()
    };

    // Return it for reportEnd
    return reportUUID;
};

export async function reportEnd(reportUUID: string): Promise<void> {
    if(!variables.performanceReportsEnabled || !(reportUUID in variables.performanceReports)) return;

    // Basically copy the dictionary
    const reportDict = variables.performanceReports[reportUUID];

    const msDuration = new Date().getMilliseconds() - reportDict.timestamp.getMilliseconds();

    const reportData: ReportData = {
        reportName: `${reportDict.reportName} took ${msDuration}ms.`,
        timestamp: new Date()
    }

    // Check if it passes the min report MS duration (optional)
    if(msDuration >= variables.performanceReportsMinMS) {
        insertDocument('Report', {reportData});
    }

    // Delete to save memory
    delete variables.performanceReports[reportUUID];
};

// Duplicate of variables.js function to prevent recursive import errors
export function decideBooleanEnvValue(value: string, valueIfNull: boolean): boolean {
    return value == null ? valueIfNull : (value.toLowerCase() == 'true' ? true : false);
}

export function generateError(msg: string, code: number, extras?: {[key: string]: any}): FronvoError {
    const err: FronvoError = {
        err: {
            msg,
            code
        }
    };

    if(extras) err.err.extras = {...extras};

    return err;
}

export async function createToken(accountId: string): Promise<string> {
    const tokenData: TokenData = {
        accountId,
        token: v4()
    };

    await insertDocument('Token', {tokenData}, accountId);

    return tokenData.token;
};

export async function getToken(accountId: string): Promise<string> {
    const tokens: {tokenData: TokenData}[] = await findDocuments('Token', {select: {tokenData: true}});

    for(const token in tokens) {
        const tokenData = tokens[token].tokenData;

        if(tokenData.accountId === accountId) {
            return tokenData.token;
        }
    }
};

export function rateLimitAnnounce(io: Server<ServerToClientEvents, ClientToServerEvents, InterServerEvents>, socket: Socket<ClientToServerEvents, ServerToClientEvents>, pointsToConsume: number): void {
    if(variables.cluster) io.serverSideEmit('updateRateLimit', socket.handshake.address, pointsToConsume);
}
