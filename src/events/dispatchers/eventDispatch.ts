// ******************** //
// The event dispatcher file which handles event requests.
// ******************** //

import accountEvents from 'events/account';
import generalEvents from 'events/general';
import noAccountEvents from 'events/noAccount';
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

function getRemainingPoints(socket: Socket<ServerToClientEvents, ClientToServerEvents>): number {
    return (rateLimiter.maxPoints) - (rateLimiter.getRatelimit(socket.handshake.address).points);
}

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

function getNeededArgs(eventName: string, givenArgs: {[key: string]: any}): string[] {
    const finalNeededArgs: string[] = [];
    const eventTemplate = funcs[eventName].template;

    for(const neededArgIndex in eventTemplate) {
        const neededArg = eventTemplate[neededArgIndex];

        if(!(neededArg in givenArgs)) {
            finalNeededArgs.push(neededArg);
        }
    }

    return finalNeededArgs;
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

function validateEventSchema(eventName: string, eventArgs: {[key: string]: any}): undefined | FronvoError {
    const eventSchema = funcs[eventName].schema;

    // Only need the first error
    const result = eventSchema.validate(eventArgs)[0];

    if(!result)
        return;
    
    const key = result.extras.key;
    const extras: {[key: string]: any} = {for: key};

    switch (result.name) {
        case 'STRING_REQUIRED':
            return generateError('REQUIRED', extras, [key]);

        case 'STRING_INVALID_LENGTH':
            return generateError('EXACT_LENGTH', extras, [key]);

        case 'STRING_INVALID_LENGTH':
            return generateError('EXACT_LENGTH', extras, [key, eventSchema.schema[key].length]);

        case 'STRING_INVALID_MIN_LENGTH':
        case 'STRING_INVALID_MAX_LENGTH':
            const min = eventSchema.schema[key].minLength;
            const max = eventSchema.schema[key].maxLength;
            
            return generateError('LENGTH', {...extras, min, max}, [key, min, max]);

        case 'STRING_INVALID_TYPE':
            switch(result.extras.type) {
                case 'email':
                    return generateError('INVALID_EMAIL_FORMAT', extras);

                default:
                    return generateError('UNKNOWN');
            }

        case 'STRING_INVALID_REGEX':
            return generateError('INVALID_REGEX', extras, [key]);

        default:
            return generateError('UNKNOWN');
    }
}

async function fireEvent(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>, socket: Socket<ServerToClientEvents, ClientToServerEvents>, eventName: string, callback: Function, eventArgs: {[key: string]: any}) {
    if(!variables.testMode) {
        // Consume event points, credited to the client's IP
        rateLimiter.consumePoints(socket.handshake.address, funcs[eventName].points)

        .then(async () => {
            // Notify other servers
            utilities.rateLimitAnnounce(io, socket, funcs[eventName].points);

            // Start the performance counter
            const perfId = utilities.reportStart(eventName);

            validateAndRun(perfId);
        })

        .catch(() => {
            // Not enough points
            sendCallback(callback, generateError('RATELIMITED'), socket);
        });
    } else {
        const perfId = utilities.reportStart(eventName);

        validateAndRun(perfId);
    }

    async function validateAndRun(perfId: string): Promise<void> {
        // Validate if a schema present
        if(funcs[eventName].schema) {
            const schemaResult = validateEventSchema(eventName, eventArgs);

            if(!schemaResult) {
                sendCallback(callback, await runEventFunc(io, socket, eventName, eventArgs), socket, perfId);
            } else {
                sendCallback(callback, schemaResult, socket, perfId);
            }
        } else {
            sendCallback(callback, await runEventFunc(io, socket, eventName, eventArgs), socket, perfId);
        }
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

function sendCallback(callback: undefined | Function, callbackResponse: undefined | {[key: string]: any}, socket: Socket<ServerToClientEvents, ClientToServerEvents>, perfId?: string): void {
    if(callback) {
        if(callbackResponse) {
            // Check if the event wasnt ratelimited
            if(perfId) {
                utilities.reportEnd(perfId);
            }

            if(!variables.testMode) {
                callbackResponse.extras = {
                    remainingPoints: getRemainingPoints(socket)
                };
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
            sendCallback(callback, eventPermissionResult, socket);
        }

        const eventArgs = filterEventArgs(event, args);

        const neededArgs = getNeededArgs(event, eventArgs);

        if(neededArgs.length > 0) {
            sendCallback(callback, generateError('MISSING_ARGS', {neededArgs}), socket);

        } else {
            fireEvent(io, socket, event, callback, eventArgs);
        }
    }
}