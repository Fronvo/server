// ******************** //
// The main event file which provides arguments to the rest of the events and manages access states.
// ******************** //

import { enums } from 'other/enums';
import * as errors from 'other/errors';
import utilities from 'utilities/all';
import { generateError } from 'utilities/global';
import * as variables from 'other/variables';
import { Server } from 'socket.io';
import { format } from 'util';

// Events
import accountEvents from 'events/account';
import generalEvents from 'events/general';
import noAccountEvents from 'events/noAccount';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { InterServerEvents } from 'interfaces/events/inter';
import { RateLimiterRes } from 'rate-limiter-flexible';
import { EventExportTemplate, RateLimiterReason } from 'interfaces/all';
import { rateLimiter } from 'other/variables';

export default function entry(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>): void {
    const funcs: EventExportTemplate = {...noAccountEvents, ...generalEvents, ...accountEvents};
    
    io.on('connection', (socket): void => {
        // TODO: Just show connected client number
        console.log('Socket ' + socket.id + ' has connected.');

        // Anything sent, which is an event, is forwarded here
        socket.onAny(async (event: string, ...args: {[arg: string]: any}[]): Promise<void> => {
            let perfId: string;
            let callback: Function;
            const filteredArgs: {[arg: string]: any} = {};

            if(event in funcs) {
                async function runFunc(): Promise<{[key: string]: any}> {
                    let callbackResponse = funcs[event].func({io, socket, ...filteredArgs});

                    if(typeof callbackResponse.then == 'function') {
                        return await callbackResponse;
                    } else {
                        return callbackResponse;
                    }
                }

                function sendCallback(callbackResponse: {[key: string]: any}, rateLimiterResult?: RateLimiterRes | RateLimiterReason): void {
                    if(callback) {
                        if(callbackResponse) {
                            // Check if the event wasnt ratelimited
                            if(perfId) {
                                utilities.reportEnd(perfId);
                                perfId = null;
                            }

                            if(!variables.testMode) {
                                callbackResponse.extras = {remainingPoints: rateLimiterResult.remainingPoints};
                            }

                            console.log(callbackResponse);
                            
                            callback(callbackResponse);

                        } else {
                            utilities.insertLog(format(errors.ERR_FUNC_RETURN_NONE, event));
                            callback(generateError(errors.ERR_UNKNOWN, enums.ERR_UNKNOWN));
                        }
                    }
                }

                // Account only
                if(event in {...accountEvents} && !utilities.isSocketLoggedIn(socket)) {
                    sendCallback(generateError(errors.ERR_MUST_BE_LOGGED_IN, enums.ERR_MUST_BE_LOGGED_IN, {event: event}));

                // No account only
                } else if(event in {...noAccountEvents} && utilities.isSocketLoggedIn(socket)) {
                    sendCallback(generateError(errors.ERR_MUST_BE_LOGGED_OUT, enums.ERR_MUST_BE_LOGGED_OUT, {event: event}));

                } else {
                    // Prevent modifications to templates, just copy
                    const neededArgs = funcs[event].template.slice();
                    const neededArgsOriginal = funcs[event].template.slice();

                    // Order the arguments according to the event's template
                    for(const item in args) {
                        const argItem = args[item];

                        if(typeof(argItem) === 'object') {
                            for(const dictItem in argItem) {
                                if(neededArgs.includes(dictItem)) {
                                    // Maintain value order, use the original dictionary to preserve index
                                    let dictItemIndex = neededArgsOriginal.indexOf(dictItem);

                                    // Add named argument to be passed later on
                                    filteredArgs[dictItem] = argItem[dictItem];

                                    // Delete has weird functionality, roll with this
                                    // Dynamic index, reassign
                                    dictItemIndex = neededArgs.indexOf(dictItem);
                                    neededArgs.splice(dictItemIndex, dictItemIndex + 1);
                                }
                            }
                            // Can combine dictionaries, dont return here
                        }
                    };

                    // Find the callback
                    for(const item in args) {
                        const argItem = args[item];

                        // Only one callback, dont overwrite
                        if(typeof(argItem) === 'function' && !callback) {
                            callback = argItem;
                            break;
                        }
                    };

                    if(neededArgs.length > 0) {
                        // Stylise missing arguments
                        let neededArgsString = errors.ERR_MISSING_ARGS;
                        
                        for(const item in neededArgs) {
                            if(!(parseInt(item) == 0)) {
                                neededArgsString += ', ';
                            }
                        
                            neededArgsString += '\'' + neededArgs[item] + '\'';
                        
                            if(parseInt(item) == (neededArgs.length - 1)) neededArgsString += '.';
                        }

                        sendCallback(generateError(neededArgsString, enums.ERR_MISSING_ARGS, {args_needed: neededArgs}));

                    } else {
                        perfId = utilities.reportStart(event);

                        if(!variables.testMode) {
                            // Consume event points, credited to the client's IP
                            rateLimiter.consume(socket.handshake.address, funcs[event].points)

                            .then(async (result) => {
                                // Notify other servers
                                utilities.rateLimitAnnounce(io, socket, funcs[event].points);

                                // Start the performance counter
                                perfId = utilities.reportStart(event);

                                sendCallback(await runFunc(), result);
                            })

                            .catch((reason: RateLimiterReason) => {
                                // Not enough points / Out of points, give ratelimit info
                                sendCallback(generateError(errors.ERR_RATELIMITED, enums.ERR_RATELIMITED, {ratelimitMS: reason.msBeforeNext}), reason);
                            });
                        } else {
                            // Test mode, only run
                            sendCallback(await runFunc());
                        }
                    }
                }
            }
        });
        
        socket.on('disconnect', (): void => {
            // Logout if logged in
            if(utilities.isSocketLoggedIn(socket)) {
                utilities.logoutSocket(io, socket);
            }
            
            console.log('Socket ' + socket.id + ' has disconnected.');

            // Exit process when the test client disconnects
            if(variables.testMode) {
                process.exit();
            }
        });
    });

    io.engine.on('connection_error', (err: Error) => {
        // @ts-ignore
        // Socket.IO adds the code property
        // TODO: Make a custom type
        console.log('Connection abnormally closed:  [' + err.code + ']' +  err.message);
    });

    // The following events are only called while using PM2 to be able to synchronise each server's variables
    // TODO: Seperate folder for inter-server events
    io.on('updateRateLimit', (socketIP, pointsToConsume) => {
        // There can't be an exception here, called inside of consumption from other servers
        rateLimiter.consume(socketIP, pointsToConsume).catch(() => {});
    });

    io.on('loginSocket', (socketId, accountId) => {
        variables.loggedInSockets[socketId] = {accountId};
    });

    io.on('logoutSocket', (socketId) => {
        delete variables.loggedInSockets[socketId];
    });
}
