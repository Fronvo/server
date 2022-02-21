// ******************** //
// The main event file which provides arguments to the rest of the events and manages access states.
// ******************** //

// No account only
const noAccountEvents = require('./noAccount');

// Account only
const accountEvents = require('./account');

// General
const generalFuncs = require('./general');

// Other
const utilities = require('../other/utilities');
const errors = require('../other/errors');
const { enums } = require('../other/enums');
const templates = require('../other/templates');
const { format } = require('util');
const variables = require('../other/variables');

module.exports = (io, mdb) => {
    // Add each file with functions here
    const noAccountOnlyFuncs = {...noAccountEvents};
    const accountOnlyFuncs = {...accountEvents};

    const funcs = {...noAccountOnlyFuncs, ...accountOnlyFuncs, ...generalFuncs};

    io.on('connection', (socket) => {
        console.log('Socket ' + socket.id + ' has connected.');

        // Anything sent, which is an event, is forwarded here
        socket.onAny(async (event, ...args) => {

            // Pay attention, every event MUST be in the templates file aswell
            if(event in funcs && event in templates) {

                // Prevent modifications to templates, just copy
                const neededArgs = templates[event].slice();
                const neededArgsOriginal = templates[event].slice();

                const filteredArgs = [];
                let callbackResponse;
                let prematureError = false;

                // Account only
                if(event in accountOnlyFuncs && !utilities.isSocketLoggedIn(socket)) {
                    prematureError = true;
                    callbackResponse = {msg: errors.ERR_MUST_BE_LOGGED_IN, code: enums.ERR_MUST_BE_LOGGED_IN, event: event};

                // No account only
                } else if(event in noAccountOnlyFuncs && utilities.isSocketLoggedIn(socket)) {
                    prematureError = true;
                    callbackResponse = {msg: errors.ERR_MUST_BE_LOGGED_OUT, code: enums.ERR_MUST_BE_LOGGED_OUT, event: event};

                // Order the arguments according to the event's template
                } else {
                    for(let item in args) {
                        item = args[item];

                        if(typeof(item) === 'object') {
                            for(const dictItem in item) {
                                if(neededArgs.includes(dictItem)) {
                                    // Maintain value order, use the original dictionary to preserve index
                                    let dictItemIndex = neededArgsOriginal.indexOf(dictItem);

                                    filteredArgs[dictItemIndex] = item[dictItem];

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

                // Here, if we put it in the above else block prematureErrors wont be callback'd
                let callback;

                for(let item in args) {
                    item = args[item];

                    // Only one callback, dont overwrite
                    if(typeof(item) === 'function' && !callback) {
                        callback = item;
                        break;
                    }
                };

                if(!prematureError) {
                    if(neededArgs.length > 0) {
                        let neededArgsString = errors.ERR_MISSING_ARGS;
                        
                        for(const item in neededArgs) {
                            if(!(item == 0)) {
                                neededArgsString += ', ';
                            }
                        
                            neededArgsString += '\'' + neededArgs[item] + '\'';
                        
                            if(item == (neededArgs.length - 1)) neededArgsString += '.';
                        }

                        callbackResponse = {msg: neededArgsString, code: enums.ERR_MISSING_ARGS, args_needed: neededArgs};
                    } else {
                        // Start it anyway, will be decided in the function itself if applicable
                        const perfId = utilities.perfStart(event);

                        callbackResponse = funcs[event](io, socket, mdb, ...filteredArgs);

                        // If async, await
                        if(callbackResponse) {
                            if(typeof(callbackResponse.then) === 'function') callbackResponse = await callbackResponse;
                        }

                        utilities.perfEnd(mdb, perfId);
                    }
                }

                if(callback) {
                    if(callbackResponse) {
                        // Eg.: [null, token] | [false]
                        if(Array.isArray(callbackResponse)) { callback(...callbackResponse); console.log(...callbackResponse) }
                        
                        // Pass normal dictionary, no spreading
                        else { callback(callbackResponse); console.log(callbackResponse) }
                    } else {
                        utilities.insertLog(mdb, format(errors.ERR_FUNC_RETURN_NONE, event));
                        callback({msg: errors.ERR_UNKNOWN, code: enums.ERR_UNKNOWN});
                    }
                }
            }
        });
        
        socket.on('disconnect', () => {
            // Logout if logged in
            if(utilities.isSocketLoggedIn(socket)) {
                utilities.logoutSocket(io, socket);
            }
            
            console.log('Socket ' + socket.id + ' has disconnected.');
        });
    });
    
    io.engine.on('connection_error', (err) => {
        console.log('Connection abnormally closed:  [' + err.code + ']' +  err.message);
    });

    // The following events are only called while using PM2 to be able to synchronise each server's variables
    io.on('loginSocket', (socketId, accountId) => {
        variables.loggedInSockets[socketId] = accountId;
    });

    io.on('logoutSocket', socketId => {
        delete variables.loggedInSockets[socketId];
    });
}
