// ******************** //
// Reusable functions for all kinds of events to avoid repetition.
// ******************** //

import { LogData, Prisma, ReportData, TokenData } from '@prisma/client';
import { writeFile } from 'fs';
import { FronvoError, LoggedInSocket } from 'interfaces/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import errors from 'other/errors';
import errorsExtra from 'other/errorsExtra';
import { CollectionNames, Errors } from 'other/types';
import * as variables from 'variables/global';
import { localDB, prismaClient } from 'variables/global';
import { Server, Socket } from 'socket.io';
import { format } from 'util';
import { v4 } from 'uuid';
import gmail from 'gmail-send';

export function saveLocalDB(): void {
    if (!variables.localMode || !variables.localSave) return;

    // Asynchronous write, boosts local development even more
    writeFile(
        variables.localDBPath,
        JSON.stringify(localDB, null, '\t'),
        (err) => {
            if (err) {
                console.log(errorsExtra.LOCAL_DB_FAIL);
            }
        }
    );
}

export async function insertDocument(
    collName: CollectionNames,
    dict: { [key: string]: any },
    recordId?: string
): Promise<void> {
    if (!variables.localMode) {
        await prismaClient[collName].create({
            data: { ...dict },
        });
    } else {
        // Loop and find if a dictionary with the same _id key exists, if recordId is provided
        if (recordId) {
            for (const dictIndex in localDB[collName]) {
                const dictItem: Partial<{ _id: string }> =
                    localDB[collName][dictIndex];

                // Overwrite
                if (dictItem._id == recordId) {
                    localDB[collName].splice(
                        Number(dictIndex),
                        Number(dictIndex) + 1
                    );
                }
            }
        }

        // Fallback, create a new key

        // No recordId provided, anonymise record
        if (!recordId) dict._id = v4();
        else dict._id = recordId;

        localDB[collName].push(dict);

        saveLocalDB();
    }
}

export async function findDocuments(
    collName: CollectionNames,
    prismaFilter?: Partial<Prisma.SelectAndInclude>
): Promise<any[]> {
    if (!variables.localMode) {
        return await prismaClient[collName].findMany(
            prismaFilter ? prismaFilter : {}
        );
    } else {
        return localDB[collName];
    }
}

export function insertLog(info: string): void {
    const logData: LogData = {
        info,
        timestamp: new Date(),
    };

    insertDocument('Log', { logData });
}

export function loginSocket(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    accountId: string
): void {
    variables.loggedInSockets[socket.id] = { accountId };

    // Remove from unauthorised ratelimits
    if (!variables.testMode) {
        // Add accountId to ratelimits if not present
        if (!variables.rateLimiter.getRateLimit(accountId)) {
            variables.rateLimiter.createRateLimit(accountId);
        }

        variables.rateLimiterUnauthorised.clearRateLimit(
            socket.handshake.address,
            true
        );
    }

    // Update other servers in cluster mode
    if (variables.cluster) {
        io.serverSideEmit('loginSocket', {
            socketId: socket.id,
            socketIP: socket.handshake.address,
            accountId,
        });
    }
}

export function logoutSocket(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>
): void {
    if (!variables.testMode) {
        const accountId = getSocketAccountId(socket.id);

        // Noone is logged in, remove ratelimit
        if (!isAccountLoggedIn(accountId)) {
            variables.rateLimiter.clearRateLimit(accountId, true);
        }
    }

    if (variables.cluster) {
        io.serverSideEmit('logoutSocket', {
            socketId: socket.id,
        });
    }

    delete variables.loggedInSockets[socket.id];
}

export function isSocketLoggedIn(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>
): boolean {
    return socket.id in variables.loggedInSockets;
}

export function isAccountLoggedIn(accountId: string): boolean {
    for (const socketKeyIndex in variables.loggedInSockets) {
        if (getSocketAccountId(socketKeyIndex) == accountId) {
            return true;
        }
    }

    return false;
}

export function getSocketAccountId(socketId: string): string {
    return variables.loggedInSockets[socketId].accountId;
}

export function getLoggedInSockets(): { [socketId: string]: LoggedInSocket } {
    return variables.loggedInSockets;
}

export function reportStart(reportName: string): string {
    if (!variables.performanceReportsEnabled) return;

    // Mantain uniqueness regardless of reportName
    const reportUUID = v4();

    variables.performanceReports[reportUUID] = {
        reportName,
        timestamp: new Date(),
    };

    // Return it for reportEnd
    return reportUUID;
}

export async function reportEnd(reportUUID: string): Promise<void> {
    if (
        !variables.performanceReportsEnabled ||
        !(reportUUID in variables.performanceReports)
    )
        return;

    // Basically copy the dictionary
    const reportDict = variables.performanceReports[reportUUID];

    const msDuration =
        new Date().getMilliseconds() - reportDict.timestamp.getMilliseconds();

    const reportData: ReportData = {
        reportName: `${reportDict.reportName} took ${msDuration}ms.`,
        timestamp: new Date(),
    };

    // Check if it passes the min report MS duration (optional)
    if (msDuration >= variables.performanceReportsMinMS) {
        insertDocument('Report', { reportData });
    }

    // Delete to save memory
    delete variables.performanceReports[reportUUID];
}

export function getErrorCode(errName: Errors): number {
    return Object.keys(errors).indexOf(errName) + 1;
}

export function getErrorKey(errCode: number): Errors {
    // @ts-ignore
    // It is an Errors string
    return Object.keys(errors).at(errCode - 1);
}

export function generateError(
    name: Errors,
    extras?: { [key: string]: any },
    formatParams?: any[]
): FronvoError {
    let msg: string = errors[name];

    if (formatParams) msg = format(msg, ...formatParams);

    const err: FronvoError = {
        err: {
            msg,
            code: getErrorCode(name),
            name,
        },
    };

    if (extras) err.err.extras = extras;

    return err;
}

export async function createToken(accountId: string): Promise<string> {
    const tokenData: TokenData = {
        accountId,
        token: v4(),
    };

    await insertDocument('Token', { tokenData }, accountId);

    return tokenData.token;
}

export async function getToken(accountId: string): Promise<string> {
    const tokens: { tokenData: TokenData }[] = await findDocuments('Token', {
        select: { tokenData: true },
    });

    for (const token in tokens) {
        const tokenData = tokens[token].tokenData;

        if (tokenData.accountId === accountId) {
            return tokenData.token;
        }
    }
}

export function rateLimitAnnounce(
    io: Server<ServerToClientEvents, ClientToServerEvents, InterServerEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    pointsToConsume: number
): void {
    if (variables.cluster) {
        // Detect authorisation state first, fire accordingly
        if (isSocketLoggedIn(socket)) {
            io.serverSideEmit('updateRateLimit', {
                accountId: getSocketAccountId(socket.id),
                pointsToConsume,
            });
        } else {
            io.serverSideEmit('updateRateLimitUnauthorised', {
                socketIP: socket.handshake.address,
                pointsToConsume,
            });
        }
    }
}

export function generateNumbers(
    from: number,
    to: number,
    times: number
): string {
    let generatedNumbers = '';

    for (let i = 0; i < times; i++) {
        generatedNumbers += Math.floor(Math.random() * (to - from + 1)) + from;
    }

    return generatedNumbers;
}

export async function sendEmail(
    to: string,
    subject: string,
    content: string
): Promise<void> {
    if (!variables.emailUsername || !variables.emailPassword) {
        console.log(errorsExtra.EMAIL_NOT_SETUP);
        return;
    }

    const send = gmail({
        user: variables.emailUsername,
        pass: variables.emailPassword,
        to,
        subject,
    });

    await send({
        text: content,
    });
}
