const utilities = require('../other/utilities');
const schemas = require('../other/schemas');
const { JoiE, General, Account } = require('../other/enums');
const errors = require('../other/errors');
const { format } = require('util');

module.exports = (socket, mdb) => {
    mdbAccounts = mdb.collection('accounts');
    mdbTokens = mdb.collection('tokens');

    function decideAccountSchemaResult(schemaResult, callback) {
        if(!schemaResult.error) return false;

        function decideErrorDict() {
            const schemaDetails = schemaResult.error.details[0];
            const schemaType = schemaDetails.type;
            const schemaMessage = schemaDetails.message;
            const schemaPath = schemaDetails.path[0];

            // default dict to reuse
            let resultDict = {msg: schemaMessage, code: General.ERR_UNKNOWN.value};

            if(schemaPath === 'email' || schemaPath === 'password') {
                // provide additional info for the end user
                resultDict['extras'] = {for: schemaPath};

                let limits = utilities.getMinMaxEntriesForAccounts();

                switch(schemaType) {
                    case JoiE.TYPE_REQUIRED.value:
                    case JoiE.TYPE_EMPTY.value:
                        resultDict.msg = format(errors.ERR_REQUIRED, schemaPath);
                        resultDict.code = General.ERR_REQUIRED.value;
                        break;

                    case JoiE.TYPE_MIN.value:
                    case JoiE.TYPE_MAX.value:
                        resultDict.msg = format(errors.ERR_LENGTH, schemaPath, limits[schemaPath].min, limits[schemaPath].max);
                        resultDict.code = General.ERR_LENGTH.value;
                        resultDict.extras['min'] = limits[schemaPath].min;
                        resultDict.extras['max'] = limits[schemaPath].max;
                        break;

                    case JoiE.TYPE_INVALID_EMAIL_FORMAT.value:
                        resultDict.msg = errors.ERR_INVALID_EMAIL_FORMAT;
                        resultDict.code = Account.ERR_INVALID_EMAIL_FORMAT.value;
                        break;
                }

                return resultDict;
            }
        }

        if(callback) callback(decideErrorDict());
        return true;
    }

    function decideAccountTokenSchemaResult(schemaResult, callback) {
        if(!schemaResult.error) return false;

        function decideErrorDict() {
            let resultDict = {msg: errors.ERR_UNKNOWN, code: General.ERR_UNKNOWN.value};

            switch(schemaResult.error.details[0].type) {
                case JoiE.TYPE_REQUIRED.value:
                case JoiE.TYPE_EMPTY.value:
                    resultDict.msg = format(errors.ERR_REQUIRED, 'token');
                    resultDict.code = General.ERR_REQUIRED.value;
                    break;

                case JoiE.TYPE_LENGTH.value:
                    resultDict.msg = format(errors.ERR_EXACT_LENGTH, 'token', 36);
                    resultDict.code = General.ERR_EXACT_LENGTH.value;
                    break;

                case JoiE.TYPE_REGEX.value:
                    resultDict.msg = format(errors.ERR_INVALID_REGEX, 'token');
                    resultDict.code = Account.ERR_INVALID_REGEX.value;
                    break;
            }
            return resultDict;
        }

        if(callback) callback(decideErrorDict());
        return true;
    }

    function enableMainEvents() {
        // first, remove account events
        socket.removeAllListeners('register', 'login', 'loginToken');
    }

    socket.on('register', (data, callback) => {
        if(!data) return;

        if(decideAccountSchemaResult(schemas.accountSchema.validate({
            email: data.email,
            password: data.password,
        }), callback)) { return; };

        mdbAccounts.find({}).toArray((err, keys) => {
            let accountFound = false;

            // check if email exists
            keys.forEach((key) => {
                delete key._id;

                const accountDict = key[Object.keys(key)[0]];

                if(accountDict.email === data.email) {
                    accountFound = true;
                    return;
                }
            });

            if(!accountFound) {
                // generate the account
                let accountData = {};
                let accountId = utilities.generateId();

                accountData[accountId] = {
                    username: 'Fronvo User ' + (keys.length + 1),
                    email: data.email,
                    password: require('bcrypt').hashSync(data.password, 12),
                    creationDate: new Date(),
                };
                
                utilities.registerAccount(mdb, accountData)
                .then((token) => {
                    utilities.loginSocket(socket, mdb, accountId);
                    enableMainEvents();

                    if(callback) callback(null, token);
                });

            } else {
                if(callback) callback({msg: errors.ERR_ACC_ALR_EXISTS, code: Account.ERR_ACC_ALR_EXISTS.value});
            }
        });
    });

    socket.on('login', (data, callback) => {
        if(!data) return;

        if(decideAccountSchemaResult(schemas.accountSchema.validate({
            email: data.email,
            password: data.password,
        }), callback)) { return; };

        // check if account existt
        mdbAccounts.find({}).toArray((err, keys) => {
            let accountFound = false;

            keys.forEach((key) => {
                delete key._id;

                const accountId = Object.keys(key)[0];
                const accountDict = key[accountId];

                if(accountDict.email === data.email) {
                    accountFound = true;

                    // check if password is correct
                    if(require('bcrypt').compareSync(data.password, accountDict.password)) {
                        utilities.loginSocket(socket, mdb, accountId)
                        .then((token) => {
                            enableMainEvents();
                            if(callback) callback(null, token);
                        });
                    } else {
                        if(callback) callback({msg: errors.ERR_INVALID_PASSWORD, code: Account.ERR_INVALID_PASSWORD.value});
                    }

                    return;
                }
            });

            if(!accountFound) {
                if(callback) callback({msg: errors.ERR_ACC_DOESNT_EXIST, code: Account.ERR_ACC_DOESNT_EXIST.value})
            }
        });
    });

    socket.on('loginToken', (data, callback) => {
        if(!data) return;

        if(decideAccountTokenSchemaResult(schemas.accountTokenSchema.validate({
            token: data.token
        }), callback)) { return; }

        mdbTokens.find({}).toArray((err, keys) => {
            let tokenFound = false;

            keys.forEach((key) => {
                delete key._id;

                const targetToken = Object.keys(key)[0];
                
                if(targetToken === data.token) {
                    tokenFound = true;

                    utilities.loginSocket(socket, mdb, key[targetToken]['accountId'])
                    .then((token) => {
                        enableMainEvents();

                        if(callback) callback();
                    });
                }
            });

            if(!tokenFound) {
                if(callback) callback({msg: errors.ERR_INVALID_TOKEN, code: Account.ERR_INVALID_TOKEN.value})
            }
        });
    });
}
