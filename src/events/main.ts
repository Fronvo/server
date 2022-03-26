// ******************** //
// The main event file which provides arguments to the rest of the events and manages access states.
// ******************** //

import { enums } from 'other/enums';
import * as errors from 'other/errors';
import * as templates from 'other/templates';
import * as utilities from 'other/utilities';
import { generateError } from 'other/utilities';
import * as variables from 'other/variables';
import { Server } from 'socket.io';
import { format } from 'util';

// Events
import accountEvents from 'events/account';
import generalFuncs from 'events/general';
import noAccountEvents from 'events/noAccount';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { InterServerEvents } from 'interfaces/events/inter';

export default function entry(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>): void {
    // Add each file with functions here
    const noAccountOnlyFuncs = {...noAccountEvents};
    const accountOnlyFuncs = {...accountEvents};

    const funcs: {[eventName: string]: Function} = {...noAccountOnlyFuncs, ...accountOnlyFuncs, ...generalFuncs};

    io.on('connection', (socket): void => {
        console.log('Socket ' + socket.id + ' has connected.');

        // Anything sent, which is an event, is forwarded here
        socket.onAny(async (event: string, ...args: {[arg: string]: any}[]): Promise<void> => {

            // Pay attention, every event MUST be in the templates file aswell
            if(event in funcs && event in templates) {

                // Prevent modifications to templates, just copy
                const neededArgs: string[] = templates[event].slice();
                const neededArgsOriginal: string[] = templates[event].slice();

                const filteredArgs: {[arg: string]: any} = {};
                let callback: Function;
                let callbackResponse: {[key: string]: any};
                let prematureError = false;

                // Account only
                if(event in accountOnlyFuncs && !utilities.isSocketLoggedIn(socket)) {
                    prematureError = true;
                    callbackResponse = generateError(errors.ERR_MUST_BE_LOGGED_IN, enums.ERR_MUST_BE_LOGGED_IN, {event: event});

                // No account only
                } else if(event in noAccountOnlyFuncs && utilities.isSocketLoggedIn(socket)) {
                    prematureError = true;
                    callbackResponse = generateError(errors.ERR_MUST_BE_LOGGED_OUT, enums.ERR_MUST_BE_LOGGED_OUT, {event: event});

                // Order the arguments according to the event's template
                } else {
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
                }

                // Find the callback
                for(const item in args) {
                    const argItem = args[item];

                    // Only one callback, dont overwrite
                    if(typeof(argItem) === 'function' && !callback) {
                        callback = argItem;
                        break;
                    }
                };

                if(!prematureError) {
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

                        callbackResponse = generateError(neededArgsString, enums.ERR_MISSING_ARGS, {args_needed: neededArgs});
                    } else {
                        // Start it anyway, will be decided in the function itself if applicable
                        const perfId = utilities.perfStart(event);

                        // Works for optional arguments
                        callbackResponse = funcs[event]({io, socket, ...filteredArgs});

                        // If async, await
                        if(callbackResponse) {
                            // @ts-ignore
                            // Yes it IS an async function
                            if(typeof(callbackResponse.then) === 'function') {
                                callbackResponse = await callbackResponse;
                            }
                        }

                        utilities.perfEnd(perfId);
                    }
                }

                if(callback) {
                    if(callbackResponse) {
                        callback(callbackResponse);

                    } else {
                        utilities.insertLog(format(errors.ERR_FUNC_RETURN_NONE, event));
                        callback(generateError(errors.ERR_UNKNOWN, enums.ERR_UNKNOWN));
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
        console.log('Connection abnormally closed:  [' + err.code + ']' +  err.message);
    });

    // The following events are only called while using PM2 to be able to synchronise each server's variables
    io.on('loginSocket', (socketId, accountId) => {
        variables.loggedInSockets[socketId] = {accountId};
    });

    io.on('logoutSocket', (socketId) => {
        delete variables.loggedInSockets[socketId];
    });
}
