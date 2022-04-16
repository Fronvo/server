// ******************** //
// The event dispatcher file which handles event requests.
// ******************** //

import accountEvents from 'events/account';
import generalEvents from 'events/general';
import noAccountEvents from 'events/noAccount';
import { EzError } from 'ez-ratelimiter';
import { EventExportTemplate, FronvoError } from 'interfaces/all';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import * as variables from 'other/variables';
import { rateLimiter } from 'other/variables';
import { Server, Socket } from 'socket.io';
import utilities from 'utilities/all';
import { generateError } from 'utilities/global';

const funcs: EventExportTemplate = {...noAccountEvents, ...generalEvents, ...accountEvents};

function filterEventArgs(eventName: string, eventArgs: {[key: string]: any}): {[key: string]: any} {
    // Prevent modifications to templates, just copy
    const finalEventArgs: {[key: string]: any} = {};

    for(const eventArgIndex in eventArgs) {
        const eventArgItem = eventArgs[eventArgIndex];
        
        // Must be a dictionary, probably, thanks js
        if(typeof(eventArgItem) === 'object') {

            for(const eventArg in eventArgItem) {                
                
                // Must be a needed argument, prevent invalid ones
                if(funcs[eventName].template.includes(eventArg)) {

                    // Add to final arguments
                    finalEventArgs[eventArg] = eventArgItem[eventArg];
                }
            }
            // Can combine dictionaries, dont return here
        }
    }

    return finalEventArgs;
}

function findCallback(eventArgs: {[arg: string]: any}): undefined | Function {
    for(const eventArgIndex in eventArgs) {
        const eventArgItem = eventArgs[eventArgIndex];

        if(typeof(eventArgItem) === 'function') {
            return eventArgItem;
        }
    }
}

function checkEventPermission(eventName: string, socket: Socket<ServerToClientEvents, ClientToServerEvents>): undefined | FronvoError {
    if(eventName in accountEvents && !utilities.isSocketLoggedIn(socket)) {
        return generateError('MUST_BE_LOGGED_IN', {eventName});

    } else if(eventName in noAccountEvents && utilities.isSocketLoggedIn(socket)) {
        return generateError('MUST_BE_LOGGED_OUT', {eventName});
    }
}

async function fireEvent(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>, socket: Socket<ServerToClientEvents, ClientToServerEvents>, eventName: string, callback: Function, eventArgs: {[key: string]: any}) {
    if(!variables.testMode) {
        // Consume event points, credited to the client's IP
        rateLimiter.consumePoints(socket.handshake.address, funcs[eventName].points)

        .then(async (limit) => {
            // Notify other servers
            utilities.rateLimitAnnounce(io, socket, funcs[eventName].points);

            // Start the performance counter
            const perfId = utilities.reportStart(eventName);

            sendCallback(callback, await runEventFunc(io, socket, eventName, eventArgs), perfId, limit.remainingPoints);
        })

        .catch((reason: EzError) => {
            // Not enough points / Out of points, give ratelimit info
            sendCallback(callback, generateError('RATELIMITED'), undefined, reason.currentPoints);
        });
    } else {
        const perfId = utilities.reportStart(eventName);

        // Test mode, only run
        sendCallback(callback, await runEventFunc(io, socket, eventName, eventArgs), perfId);
    }
}

async function runEventFunc(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>, socket: Socket<ServerToClientEvents, ClientToServerEvents>, event: string, args: {[arg: string]: any} = {}): Promise<{[key: string]: any}> {
    let callbackResponse = funcs[event].func({ io, socket, ...args });

    if(typeof callbackResponse.then == 'function') {
        return await callbackResponse;
    } else {
        return callbackResponse;
    }
}

function sendCallback(callback: undefined | Function, callbackResponse: undefined | {[key: string]: any}, perfId?: string, remainingPoints?: number): void {
    if(callback) {
        if(callbackResponse) {
            // Check if the event wasnt ratelimited
            if(perfId) {
                utilities.reportEnd(perfId);
            }

            if(!variables.testMode) {
                callbackResponse.extras = {remainingPoints};
            }
            
            callback(callbackResponse);

        } else {
            callback(generateError('UNKNOWN'));
        }
    }
}

export default function eventDispatch(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>, socket: Socket<ServerToClientEvents, ClientToServerEvents>, event: string, ...args: {[arg: string]: any}[]): void {
    if(event in funcs) {
        const eventPermissionResult = checkEventPermission(event, socket);

        const callback = findCallback(args);

        if(eventPermissionResult) {
            sendCallback(callback, eventPermissionResult);
        }

        const eventArgs = filterEventArgs(event, args);

        if(eventArgs.length > 0) {
            sendCallback(callback, generateError('MISSING_ARGS', {eventArgs}));

        } else {
            fireEvent(io, socket, event, callback, eventArgs);
        }
    }
}