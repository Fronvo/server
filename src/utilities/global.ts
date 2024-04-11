// ******************** //
// Reusable functions for all kinds of events to avoid repetition.
// ******************** //

import { EzierValidatorError, StringSchema } from '@ezier/validate';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
import gmail from 'gmail-send';
import { FronvoError, LoggedInSocket } from 'interfaces/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import errors from 'other/errors';
import { Errors } from 'other/types';
import { Server, Socket } from 'socket.io';
import { format } from 'util';
import { v4 } from 'uuid';
import * as variables from 'variables/global';
import { aesEnc, aesIV } from 'variables/global';
import { prismaClient } from 'variables/global';
import { createCipheriv, createDecipheriv } from 'crypto';
import ImageKit from 'imagekit';
import jwt from 'jsonwebtoken';
import { client } from 'main/server';
const secret = process.env.FRONVO_SECRET_KEY;

export async function loginSocket(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    accountId: string,
    fcm?: string
): Promise<void> {
    variables.loggedInSockets[socket.id] = { accountId, socket, fcm };

    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        select: {
            profileId: true,
            friends: true,
            pendingFriendRequests: true,
        },
    });

    let dmsFinished = false;
    let serversFinished = false;
    let friendsFinished = false;

    async function subscribeToDMS(): Promise<void> {
        const availableDMS = await prismaClient.dm.findMany({
            where: {
                dmUsers: {
                    has: account.profileId,
                },
            },
        });

        for (const dmIndex in availableDMS) {
            const dm = availableDMS[dmIndex];

            // Find the correct profile room to join, not ours
            let targetDMUser = dm.dmUsers[0];

            if (targetDMUser == account.profileId) {
                targetDMUser = dm.dmUsers[1];
            }

            // Must be a friend
            if (!account.friends.includes(targetDMUser)) continue;

            socket.join(targetDMUser as string);

            socket.join(availableDMS[dmIndex].roomId);
        }

        dmsFinished = true;
    }

    async function subscribeToServers(): Promise<void> {
        // Add to all of the available servers
        const availableServers = await prismaClient.server.findMany({
            where: {
                members: {
                    has: account.profileId,
                },
            },
        });

        for (const serverIndex in availableServers) {
            const server = availableServers[serverIndex];

            // Server room for general details
            socket.join(server.serverId);

            // All server member rooms
            for (const memberIndex in server.members) {
                const member = server.members[memberIndex];

                if (member != accountId) {
                    socket.join(server.members[memberIndex] as string);
                }
            }

            // All server channel rooms
            for (const channelIndex in server.channels) {
                socket.join(server.channels[channelIndex] as string);
            }
        }

        serversFinished = true;
    }

    async function subscribeToFriends(): Promise<void> {
        // All friend rooms too
        for (const friendIndex in account.friends) {
            socket.join(account.friends[friendIndex] as string);
        }

        for (const pendingFriendIndex in account.pendingFriendRequests) {
            socket.join(
                account.pendingFriendRequests[pendingFriendIndex] as string
            );
        }

        friendsFinished = true;
    }

    async function queueSubscribing(): Promise<void> {
        subscribeToDMS();
        subscribeToServers();
        subscribeToFriends();

        return new Promise((resolve) => {
            let interval = setInterval(() => {
                if (dmsFinished && serversFinished && friendsFinished) {
                    clearInterval(interval);

                    resolve();
                }
            }, 20);
        });
    }

    await queueSubscribing();

    io.to(account.profileId).emit('onlineStatusUpdated', {
        profileId: account.profileId,
        online: true,
    });
}

export async function logoutSocket(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>
): Promise<void> {
    const profileId = getSocketAccountId(socket.id);

    // Delay to prevent event errors
    setTimeout(() => {
        delete variables.loggedInSockets[socket.id];
    }, variables.batchUpdatesDelay);

    const account = await prismaClient.account.findFirst({
        where: {
            profileId,
        },

        select: {
            profileId: true,
        },
    });

    // Possibol
    if (!account) return;

    await client.del(account.profileId)

    io.to(account.profileId).emit('onlineStatusUpdated', {
        profileId: account.profileId,
        online: false,
    });
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

export function getAccountSocketId(accountId: string): string {
    for (const socketKeyIndex in variables.loggedInSockets) {
        if (getSocketAccountId(socketKeyIndex) == accountId) {
            return socketKeyIndex;
        }
    }

    return '';
}

export function getSocketAccountId(socketId: string): string {
    return variables.loggedInSockets[socketId]?.accountId;
}

export function getLoggedInSockets(): { [socketId: string]: LoggedInSocket } {
    return variables.loggedInSockets;
}

export function setSocketRoomId(socketId: string, roomId: string): void {
    variables.loggedInSockets[socketId].currentRoomId = roomId;
}

export function getSocketsInRoomId(roomId: string): LoggedInSocket[] {
    const sockets: LoggedInSocket[] = [];

    for (const socketIndex in variables.loggedInSockets) {
        const socket = variables.loggedInSockets[socketIndex];

        if (socket.currentRoomId == roomId) {
            sockets.push(socket);
        }
    }

    return sockets;
}

export async function sendFCM(
    fcm: string[],
    title: string,
    content: string,
    groupToOne: boolean,
    collapseSuffix?: string
): Promise<BatchResponse> {
    // Abort empty list
    if (fcm.length == 0 || !fcm[0]) return;

    return await variables.firebase.messaging().sendEachForMulticast({
        tokens: fcm,

        notification: {
            title,
            body: content,
        },

        android: {
            restrictedPackageName: 'com.fronvo',
            notification: {
                // If FCMs are multiple / groupToOne enabled, prefer one notification
                // Otherwise seperate each notification with a random identifier

                // Friend sharePost: multiple
                // Friend likes: one

                // Collapse suffix is a way to identify dms, likes by appending certain words like -dm, -like
                tag: groupToOne
                    ? `${fcm.toString()}${
                          collapseSuffix ? '-' + collapseSuffix : ''
                      }`
                    : v4(),
            },
        },
    });
}

export async function sendMulticastFCM(
    members: string[],
    title: string,
    content: string,
    sender: string,
    groupToOne: boolean,
    collapseSuffix?: string
): Promise<string[]> {
    const finalFCMs: string[] = [];

    for (const memberIndex in members) {
        const target = members[memberIndex];

        if (target == sender) {
            continue;
        }

        const fcm = await getAccountFCM(target);

        // If an fcm exists but the account is on pc, consider ignoring fcm
        if (fcm && isAccountLoggedIn(target)) {
            // If no fcm is provided, user is from PC, ignore
            if (!variables.loggedInSockets[getAccountSocketId(target)].fcm) {
                continue;
            }
        }

        if (typeof fcm != 'undefined') {
            finalFCMs.push(fcm);
        }
    }

    // Might still be empty, some on pc and whatnot
    if (finalFCMs.length == 0) return;

    await sendFCM(finalFCMs, title, content, groupToOne, collapseSuffix);

    return finalFCMs;
}

export async function getAccountFCM(accountId: string): Promise<string> {
    for (const socketKeyIndex in variables.loggedInSockets) {
        const target = variables.loggedInSockets[socketKeyIndex];

        if (target.accountId == accountId) {
            // Attempt fetch if not online from mobile
            if (target.fcm) return target.fcm;
        }
    }

    // Try to fetch
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: accountId,
        },

        select: {
            profileId: true,
            fcm: true,
        },
    });

    if (account.fcm) {
        return account.fcm;
    }
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

export async function getToken(profileId: string): Promise<string> {
    const tokenItem = createToken({ account: profileId });
    client.set(profileId, tokenItem);

    console.log({ profileId: tokenItem });

    if (tokenItem) {
        return tokenItem;
    }

    const token = v4();

    await prismaClient.token
        .create({
            data: {
                profileId,
                token,
            },
        })
        .then(() => {
            console.log('token created');
        });

    return token;
}

export function createToken(payload) {
    const secret = process.env.FRONVO_SECRET_KEY;

    var token = jwt.sign(payload, secret, {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 1020, // around 15 mins
    });
    return token;
}

export async function verifyToken(token: string) {
    try {
        const user = jwt.verify(token, secret);
        if (user) console.log('User is verified');
    } catch (err) {
        console.log({ error: 'Unauthorized' });
    }
}

export async function revokeToken(profileId: string): Promise<void> {
    try {
        await prismaClient.token.delete({
            where: {
                profileId,
            },
        });
    } catch (e) {}
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
    if (
        !variables.emailUsername ||
        !variables.emailPassword ||
        variables.setupMode
    ) {
        return;
    }

    let finalHtml = '';

    for (const contentStrIndex in content) {
        finalHtml += `<p align='start'>
    ${content[contentStrIndex]}
</p>`;
    }

    const send = gmail({
        user: variables.emailUsername,
        pass: variables.emailPassword,
        to,
        subject,
        html: `
<html>
    <head>
        <style>
            body {
                background: rgb(255, 255, 255);
            }

            .main {
                width: 100%;
                background: white;
                padding: 10px;
            }

            .content {
                width: 40%;
                margin: auto;
                border-radius: 10px;
                background: black;
                box-shadow: black;
                padding-top: 15px;
            }

            hr {
                width: 100%;
                opacity: 25%;
                border-width: 1px;
                border-color: rgb(255, 255, 255);
            }

            p {
                font-family: Arial;
                margin-top: 5px;
                margin-bottom: 5px;
                color: white;
                font-size: 1.1rem;
                padding-right: 50px;
                padding-left: 50px;
                margin-bottom: 10px;
            }

            a {
                color: white;
            }

            #logo {
                margin-bottom: 20px;
                padding-bottom: 10px;
            }

            #top {
                margin-top: 0;
                margin-bottom: 5px;
            }

            #colored {
                color: white;
                font-size: 1.4rem;
                margin-top: 0;
                margin-bottom: 20px;
            }

            #footer {
                margin-top: 10px;
                white-space: pre-wrap;
            }

            @media screen and (max-width: 1400px) {
                .main {
                    padding: 0;
                }

                .content {
                    border-radius: 0;
                    width: 100%;
                }

                p {
                    padding-left: 25px;
                    padding-right: 25px;
                }
            }
        </style>
    </head>

    <body>
        <div class='main'>
            <div class='content'

                <p align='center' id='top'>
                    <a href='https://fronvo.com' id='top'>
                        <img src='https://github.com/Fronvo/server/blob/v2/.github/email/email-logo-large.png?raw=true'>
                    </a>

                    <hr />
                </p>

                <p align='center' id='colored'>Hello there,</p>

                ${finalHtml}

                <p align='start' id='footer'>
Sincerely,
The Fronvo team
                </p>

            </div>
        </div>
    </body>
</html>
`,
    });

    await send();
}

export function validateSchema(
    schema: StringSchema,
    schemaArgs: { [key: string]: any }
): FronvoError | undefined {
    // Only need the first error
    const schemaResults = schema.validate(schemaArgs);
    let result: EzierValidatorError;

    // Find the FIRST needed error, mustn't be an empty optional param result
    for (const errorResultIndex in schemaResults) {
        const optionalParam =
            schema.schema[schemaResults[errorResultIndex].extras.key].optional;

        if (optionalParam) {
            if (!(schemaResults[errorResultIndex].name == 'STRING_REQUIRED')) {
                result = schemaResults[errorResultIndex];
            }
        } else {
            // Not optional, legit error
            result = schemaResults[errorResultIndex];
        }

        // Continue with first valid error
        if (result) break;
    }

    // None found, success
    if (!result) return;

    const key = result.extras.key;
    const extras: { [key: string]: any } = { for: key };
    const optional = schema.schema[key].optional;

    // Different checks explained
    // For example an optional avatar key which is '' will NOT be returning a REQUIRED error and will be skipped above
    // But if that key is 'a', it WILL return the above error
    // Basically allow the events themselves to handle empty optional arguments / validate if needed
    if (!optional || (optional && key.length > 0)) {
        switch (result.name) {
            case 'STRING_REQUIRED':
                return generateError('REQUIRED', extras, [key]);

            case 'STRING_INVALID_LENGTH':
                return generateError('LENGTH_EXACT', extras, [
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
                        return generateError('REQUIRED', extras, [key]);

                    case 'uuid':
                        return generateError('REQUIRED', extras, [key]);

                    default:
                        return generateError('UNKNOWN');
                }

            case 'STRING_INVALID_REGEX':
                return generateError('INVALID_REGEX', extras, [key]);

            default:
                return generateError('UNKNOWN');
        }
    }
}

export function generateEmail(): string {
    return v4().replace(/-/g, '') + '@gmail.com';
}

export function generatePassword(): string {
    return v4().replace(/-/g, '').substring(0, 30);
}

export function generateChars(length?: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';

    const randomArray = Array.from(
        { length: length ? length : 10 },
        () => chars[Math.floor(Math.random() * chars.length)]
    );

    return randomArray.join('');
}

export function encryptAES(target: string): string {
    try {
        const cipher = createCipheriv('AES-256-CBC', aesEnc, aesIV);

        return Buffer.from(
            cipher.update(target, 'utf8', 'hex') + cipher.final('hex')
        ).toString('base64');
    } catch (e) {
        return 'CORRUPTED';
    }
}

export function decryptAES(target: string): string {
    try {
        const buff = Buffer.from(target, 'base64');
        const decipher = createDecipheriv('AES-256-CBC', aesEnc, aesIV);

        return (
            decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
            decipher.final('utf8')
        );
    } catch (e) {
        return 'CORRUPTED';
    }
}

export async function deleteImage(image: string): Promise<void> {
    if (!image || image?.length == 0) return;

    const imagekit = new ImageKit({
        urlEndpoint: image.includes(variables.imagekitFreeEndpoint)
            ? variables.imagekitFreeEndpoint
            : variables.imagekitEndpoint,
        publicKey: image.includes(variables.imagekitFreeEndpoint)
            ? variables.imagekitFreePublic
            : variables.imagekitPublic,
        privateKey: image.includes(variables.imagekitFreeEndpoint)
            ? variables.imagekitFreePrivate
            : variables.imagekitPrivate,
    });

    const targetEndpoint = image.includes(variables.imagekitFreeEndpoint)
        ? variables.imagekitFreeEndpoint
        : variables.imagekitEndpoint;

    const prevResult = await imagekit.listFiles({
        name: image
            .replace(targetEndpoint + '/', '')
            .replace(/\?updatedAt=[a-z0-9]+/, '')
            .replace(/\?tr=[a-zA-Z0-9%-]+/, ''),
        limit: 1,
    });

    if (prevResult.length > 0) {
        await imagekit.deleteFile(prevResult[0].fileId);
    }
}

export async function updateRoomSeen(roomId: string): Promise<void> {
    setTimeout(async () => {
        const targetSockets = getSocketsInRoomId(roomId);

        for (const socketIndex in targetSockets) {
            const target = targetSockets[socketIndex];

            prismaClient.account
                .findFirst({
                    where: {
                        profileId: getSocketAccountId(target.socket.id),
                    },

                    select: {
                        seenStates: true,
                    },
                })
                .then(async (newSeenStates) => {
                    if (!newSeenStates.seenStates) {
                        // @ts-ignore
                        newSeenStates.seenStates = {};
                    }

                    newSeenStates.seenStates[roomId] =
                        await prismaClient.message.count({
                            where: { roomId },
                        });

                    try {
                        await prismaClient.account.update({
                            where: {
                                profileId: getSocketAccountId(target.socket.id),
                            },

                            data: {
                                seenStates: newSeenStates.seenStates,
                            },
                        });
                    } catch (e) {}
                });
        }
    }, variables.batchUpdatesDelay);
}

export function getTransformedImage(url: string, width: number): string {
    // 1:1
    return `${url}/tr:w-${width}:h-${width}`;
}
