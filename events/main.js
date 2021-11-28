const account = require('./account');
const general = require('./general');
const utilities = require('../other/utilities');
const errors = require('../other/errors');
const { enums } = require('../other/enums');
const templates = require('../other/templates');
const { format } = require('util');

module.exports = (io, mdb) => {
    // add each file with functions here
    const noAccountOnlyFuncs = {...account};
    const accountOnlyFuncs = {};

    const funcs = {...account, ...general};

    io.on('connection', (socket) => {
        console.log('Socket ' + socket.id + ' has connected.');

        socket.onAny(async (event, ...args) => {
            if(event in funcs && event in templates) {
                // prevent modifications to templates, just copy
                const neededArgs = templates[event].slice();
                const neededArgsOriginal = templates[event].slice();

                const filteredArgs = [];
                let callbackResponse;
                let prematureError = false;

                if(event in accountOnlyFuncs && !utilities.isSocketLoggedIn(socket)) {
                    prematureError = true;
                    callbackResponse = {msg: errors.ERR_MUST_BE_LOGGED_IN, code: enums.ERR_MUST_BE_LOGGED_IN, event: event};

                } else if(event in noAccountOnlyFuncs && utilities.isSocketLoggedIn(socket)) {
                    prematureError = true;
                    callbackResponse = {msg: errors.ERR_MUST_BE_LOGGED_OUT, code: enums.ERR_MUST_BE_LOGGED_OUT, event: event};

                } else {
                    for(let item in args) {
                        item = args[item];

                        if(typeof(item) === 'object') {
                            for(const dictItem in item) {
                                if(neededArgs.includes(dictItem)) {
                                    // maintain value order, original dict to preserve index
                                    let dictItemIndex = neededArgsOriginal.indexOf(dictItem);

                                    filteredArgs[dictItemIndex] = item[dictItem];

                                    // delete has weird functionality, roll with this
                                    // dynamic index, reassign
                                    dictItemIndex = neededArgs.indexOf(dictItem);
                                    neededArgs.splice(dictItemIndex, dictItemIndex + 1);
                                }
                            }
                            // can combine dicts, dont return here
                        }
                    };
                }

                // here, if we put it in the above else block prematureErrors wont be callback'd
                let callback;

                for(let item in args) {
                    item = args[item];

                    // only one callback, dont overwrite
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
                        callbackResponse = funcs[event](socket, mdb, ...filteredArgs);

                        // if async
                        if(callbackResponse) {
                            if(typeof(callbackResponse.then) === 'function') callbackResponse = await callbackResponse;
                        }
                    }
                }

                if(callback) {
                    if(callbackResponse) {
                        // eg: [null, token] | [false]
                        if(Array.isArray(callbackResponse)) callback(...callbackResponse);
                        
                        else callback(callbackResponse);
                    } else {
                        utilities.insertLog(mdb, format(errors.ERR_FUNC_RETURN_NONE, event));
                        callback({msg: errors.ERR_UNKNOWN, code: enums.ERR_UNKNOWN});
                    }
                }
            }
        });
        
        socket.on('disconnect', () => {
            if(utilities.isSocketLoggedIn(socket)) {
                utilities.logoutSocket(socket);
            }
            
            console.log('Socket ' + socket.id + ' has disconnected.');
        });
    });
    
    io.engine.on('connection_error', (err) => {
        console.log('Connection abnormally closed:  [' + err.code + ']' +  err.message);
    });
}
