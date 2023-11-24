// ******************** //
// The event dispatcher file which handles event requests.
// ******************** //

import accountEvents from 'events/account';
import generalEvents from 'events/general';
import noAccountEvents from 'events/noAccount';
import { EventExportTemplate, FronvoError } from 'interfaces/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { Server, Socket } from 'socket.io';
import utilities from 'utilities/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

const funcs: EventExportTemplate = {
    ...noAccountEvents,
    ...generalEvents,
    ...accountEvents,
};

function filterEventArgs(
    eventName: string,
    eventArgs: { [key: string]: any }
): { [key: string]: any } {
    // Prevent modifications to templates, just copy
    const finalEventArgs: { [key: string]: any } = {};

    for (const eventArgIndex in eventArgs) {
        const eventArgItem = eventArgs[eventArgIndex];

        // Must be a dictionary, probably, thanks js
        if (typeof eventArgItem === 'object') {
            for (const eventArg in eventArgItem) {
                // Must be a needed argument, prevent invalid ones
                if (funcs[eventName].template.includes(eventArg)) {
                    // Add to final arguments, length checks if not null

                    if (typeof eventArgIndex[eventArg] == 'string') {
                        finalEventArgs[eventArg] = (
                            eventArgItem[eventArg] as string
                        ).trim();
                    } else {
                        finalEventArgs[eventArg] = eventArgItem[eventArg];
                    }
                }
            }
            // Can combine dictionaries, dont return here
        }
    }

    return finalEventArgs;
}

function getNeededArgs(
    eventName: string,
    givenArgs: { [key: string]: any }
): string[] {
    const finalNeededArgs: string[] = [];
    const eventTemplate = funcs[eventName].template;

    for (const neededArgIndex in eventTemplate) {
        const neededArg = eventTemplate[neededArgIndex];

        // Check for optional params aswell
        if (
            !(neededArg in givenArgs) &&
            !funcs[eventName].schema.schema[neededArg].optional
        ) {
            finalNeededArgs.push(neededArg);
        }
    }

    return finalNeededArgs;
}

function findCallback(eventArgs: { [arg: string]: any }): undefined | Function {
    for (const eventArgIndex in eventArgs) {
        const eventArgItem = eventArgs[eventArgIndex];

        if (typeof eventArgItem === 'function') {
            return eventArgItem;
        }
    }
}

function checkEventPermission(
    eventName: string,
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
): undefined | FronvoError {
    if (eventName in accountEvents && !utilities.isSocketLoggedIn(socket)) {
        return generateError('LOGGED_IN', { eventName });
    } else if (
        eventName in noAccountEvents &&
        utilities.isSocketLoggedIn(socket)
    ) {
        return generateError('LOGGED_OUT', { eventName });
    }
}

async function fireEvent(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ServerToClientEvents, ClientToServerEvents>,
    eventName: string,
    callback: Function,
    eventArgs: { [key: string]: any }
) {
    await validateAndRun();

    async function validateAndRun(): Promise<void> {
        // Validate if a schema present
        if (funcs[eventName].schema) {
            const schemaResult = utilities.validateSchema(
                funcs[eventName].schema,
                eventArgs
            );

            if (!schemaResult) {
                await fireCallback();
            } else {
                sendCallback(callback, schemaResult);
            }
        } else {
            await fireCallback();
        }

        async function fireCallback(): Promise<void> {
            sendCallback(
                callback,
                await runEventFunc(
                    io,
                    socket,
                    eventName,
                    funcs[eventName].dontFetchAccount,
                    eventArgs
                )
            );
        }
    }
}

async function runEventFunc(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ServerToClientEvents, ClientToServerEvents>,
    event: string,
    dontFetchAccount: boolean,
    args: { [arg: string]: any } = {}
): Promise<{ [key: string]: any }> {
    const finalArgs = {
        io,
        socket,
        account: undefined,
    };

    // Give account parameter from here, prevent errors / delays
    if (!dontFetchAccount) {
        try {
            finalArgs.account = await prismaClient.account.findFirst({
                where: {
                    profileId: getSocketAccountId(socket.id),
                },

                select: {
                    appliedTheme: true,
                    avatar: true,
                    banner: true,
                    bio: true,
                    creationDate: true,
                    dataSentTime: true,
                    email: true,
                    fcm: true,
                    friends: true,
                    isPRO: true,
                    lastPostAt: true,
                    password: true,
                    pendingFriendRequests: true,
                    proCH: true,
                    profileId: true,
                    seenStates: true,
                    status: true,
                    statusUpdatedTime: true,
                    username: true,
                },
            });
        } catch (e) {
            return generateError('UNKNOWN');
        }
    }

    let callbackResponse = funcs[event].func({ ...finalArgs, ...args });

    if (funcs)
        if (typeof callbackResponse.then == 'function') {
            try {
                return await callbackResponse;
            } catch (e) {
                return generateError('UNKNOWN');
            }
        } else {
            return callbackResponse;
        }
}

function sendCallback(
    callback: undefined | Function,
    callbackResponse: undefined | { [key: string]: any }
): void {
    if (callback) {
        if (callbackResponse) {
            callback(callbackResponse);
        } else {
            callback(generateError('UNKNOWN'));
        }
    }
}

export default function eventDispatch(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ServerToClientEvents, ClientToServerEvents>,
    event: string,
    ...args: { [arg: string]: any }[]
): void {
    if (event in funcs) {
        const eventPermissionResult = checkEventPermission(event, socket);

        const callback = findCallback(args);

        if (eventPermissionResult) {
            sendCallback(callback, eventPermissionResult);
            return;
        }

        const eventArgs = filterEventArgs(event, args);

        const neededArgs = getNeededArgs(event, eventArgs);

        if (neededArgs.length > 0) {
            sendCallback(callback, generateError('MISSING', { neededArgs }));
        } else {
            fireEvent(io, socket, event, callback, eventArgs);
        }
    }
}
