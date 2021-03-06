// ******************** //
// Reusable functions for all kinds of events to avoid repetition.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    AccountData,
    LogData,
    Prisma,
    ReportData,
    TokenData,
} from '@prisma/client';
import { writeFile } from 'fs';
import gmail from 'gmail-send';
import { FronvoError, LoggedInSocket } from 'interfaces/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import errors from 'other/errors';
import errorsExtra from 'other/errorsExtra';
import { CollectionNames, Errors } from 'other/types';
import { Server, Socket } from 'socket.io';
import { format } from 'util';
import { v4 } from 'uuid';
import * as variables from 'variables/global';
import { localDB, prismaClient } from 'variables/global';

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

export function deleteDocumentLocal(
    collName: CollectionNames,
    recordId: string
): void {
    if (!variables.localMode) return;

    const localColl = localDB[collName];

    for (const itemIndex in localColl) {
        const itemData = localColl[itemIndex];

        if (itemData._id == recordId) {
            // @ts-ignore
            localDB[collName].splice(itemIndex, 1);
        }
    }
}

export async function updateAccount(
    updateDict: { [key: string]: any },
    filterDict: { [key: string]: string }
): Promise<void> {
    const filterKey = Object.keys(filterDict)[0];
    const filterValue = filterDict[Object.keys(filterDict)[0]];

    if (!variables.localMode) {
        // Get the account OID (MongoDB object id) in order to update it
        // Super sketchy but it works, i think
        const accountsRaw = await prismaClient.account.findRaw();

        for (const account in accountsRaw) {
            const accountObj = accountsRaw[account];

            // @ts-ignore
            // Check if it's the target account
            // Filter not fulfilled, next iteration
            if (!(accountObj.accountData[filterKey] == filterValue)) continue;

            // @ts-ignore
            // Get the OID somehow
            const accountOID = accountObj._id.$oid;

            await prismaClient.account.update({
                where: { id: accountOID },
                data: {
                    accountData: {
                        update: updateDict,
                    },
                },
            });
        }
    } else {
        const accounts: { accountData: AccountData }[] = await findDocuments(
            'Account',
            { select: { accountData: true } }
        );

        for (const account in accounts) {
            const accountData = accounts[account].accountData;

            // Next iteration if it doesnt fulfill the filter
            if (!(accountData[filterKey] == filterValue)) continue;

            // Update finally
            localDB['Account'][account] = {
                accountData: {
                    ...accountData,
                    ...updateDict,
                },
            };

            saveLocalDB();
        }
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

export async function getEmailAccountId(email: string): Promise<string> {
    if (!variables.localMode) {
        const accountsRaw = await prismaClient.account.findRaw();

        for (const account in accountsRaw) {
            const accountObj = accountsRaw[account];

            // @ts-ignore
            if (!(accountObj.accountData.email == email)) continue;

            // @ts-ignore
            return accountObj.accountData.id;
        }
    } else {
        const accounts: { accountData: AccountData }[] = await findDocuments(
            'Account',
            { select: { accountData: true } }
        );

        for (const account in accounts) {
            const accountData = accounts[account].accountData;

            if (accountData.email == email) {
                return accountData.id;
            }
        }
    }
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

export async function revokeToken(accountId: string): Promise<void> {
    if (!variables.localMode) {
        const tokensRaw = await prismaClient.token.findRaw();

        for (const token in tokensRaw) {
            const tokenObj = tokensRaw[token];

            // @ts-ignore
            if (!(tokenObj.tokenData.accountId == accountId)) continue;

            // @ts-ignore
            const tokenOID = tokenObj._id.$oid;

            await prismaClient.token.delete({
                where: { id: tokenOID },
            });
        }
    } else {
        deleteDocumentLocal('Token', accountId);
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
    content: string[]
): Promise<void> {
    if (!variables.emailUsername || !variables.emailPassword) {
        console.log(errorsExtra.EMAIL_NOT_SETUP);
        return;
    }

    let finalHtml = '';

    for (const contentStrIndex in content) {
        finalHtml += `
<h1 align='center'>
    ${content[contentStrIndex]}
</h1>
`;
    }

    const send = gmail({
        user: variables.emailUsername,
        pass: variables.emailPassword,
        to,
        subject,
        html: `
<div>
    <p align='center'>
        <a href='https://fronvo.herokuapp.com'><img src='https://raw.githubusercontent.com/Fronvo/server/master/.github/email/fronvo-logo-large.png'></a>
    </p>

    ${finalHtml}

</div>
`,
    });

    await send();
}

export function validateSchema(
    schema: StringSchema,
    schemaArgs: { [key: string]: any }
): FronvoError | undefined {
    // Only need the first error
    const result = schema.validate(schemaArgs)[0];

    if (!result) return;

    const key = result.extras.key;
    const extras: { [key: string]: any } = { for: key };

    switch (result.name) {
        case 'STRING_REQUIRED':
            return generateError('REQUIRED', extras, [key]);

        case 'STRING_INVALID_LENGTH':
            return generateError('EXACT_LENGTH', extras, [key]);

        case 'STRING_INVALID_LENGTH':
            return generateError('EXACT_LENGTH', extras, [
                key,
                schema.schema[key].length,
            ]);

        case 'STRING_INVALID_MIN_LENGTH':
        case 'STRING_INVALID_MAX_LENGTH':
            const min = schema.schema[key].minLength;
            const max = schema.schema[key].maxLength;

            return generateError('LENGTH', { ...extras, min, max }, [
                key,
                min,
                max,
            ]);

        case 'STRING_INVALID_TYPE':
            switch (result.extras.type) {
                case 'email':
                    return generateError('REQUIRED_EMAIL', extras);

                case 'uuid':
                    return generateError('REQUIRED_UUID', extras);

                default:
                    return generateError('UNKNOWN');
            }

        case 'STRING_INVALID_REGEX':
            return generateError('INVALID_REGEX', extras, [key]);

        default:
            return generateError('UNKNOWN');
    }
}
