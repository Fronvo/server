const utilities = require('../other/utilities');
const schemas = require('../other/schemas');
const errors = require('../other/errors');
const { defaultError } = require('../other/variables');
const { JoiE, General, Account } = require('../other/enums');
const { format } = require('util');
const bcrypt = require('bcrypt');
const variables = require('../other/variables');

function decideAccountSchemaResult(email, password) {
    const schemaResult = schemas.accountSchema.validate({
        email: email,
        password: password
    });

    if(!schemaResult.error) return false;

    const schemaDetails = schemaResult.error.details[0];
    const schemaType = schemaDetails.type;
    const schemaMessage = schemaDetails.message;
    const schemaPath = schemaDetails.path[0];

    // default dict to reuse, copy its value
    let resultDict = {...defaultError};

    // default to JOI message
    resultDict.msg = schemaMessage;

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
    }

    return resultDict;
}

function decideAccountTokenSchemaResult(token) {
    const schemaResult = schemas.accountTokenSchema.validate({
        token: token
    });
    
    if(!schemaResult.error) return false;

    let resultDict = {...defaultError};

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

module.exports = {
    register: async (socket, mdb, email, password) => {
        const schemaResult = decideAccountSchemaResult(email, password);

        if(schemaResult) return schemaResult;

        const accounts = await utilities.listDocuments(mdb, 'accounts');
        
        let accountFound = false;

        // check if email exists
        accounts.forEach((account) => {
            delete account._id;

            if(account[Object.keys(account)[0]].email === email) {
                accountFound = true;
                return;
            }
        });

        if(!accountFound) {
            // generate the account
            const accountData = {};
            const accountId = utilities.generateId();

            accountData[accountId] = {
                username: 'Fronvo User ' + (accounts.length + 1),
                email: email,
                password: require('bcrypt').hashSync(password, 12),
                creationDate: new Date(),
            };
            
            await mdb.collection('accounts').insertOne(accountData);
            
            return [null, await utilities.loginSocket(socket, mdb, accountId)];
        } else {
            return {msg: errors.ERR_ACC_ALR_EXISTS, code: Account.ERR_ACC_ALR_EXISTS.value};
        }
    },

    login: async (socket, mdb, email, password) => {
        const schemaResult = decideAccountSchemaResult(email, password);

        if(schemaResult) return schemaResult;

        const accounts = await utilities.listDocuments(mdb, 'accounts');

        let accountFound = false;
        let accountId;
        let accountPassword;

        // check if account exists
        accounts.forEach(async (account) => {
            delete account._id;

            const accountIdKey = Object.keys(account)[0];
            const accountDict = account[accountIdKey];

            if(accountDict.email === email) {
                accountFound = true;
                accountId = accountIdKey;
                accountPassword = accountDict.password;
                return;
            }
        });

        if(accountFound) {
            // validate password
            if(bcrypt.compareSync(password, accountPassword)) {
                return [null, await utilities.loginSocket(socket, mdb, accountId)];
            } else {
                return {msg: errors.ERR_INVALID_PASSWORD, code: Account.ERR_INVALID_PASSWORD.value};
            }
        }
        else return {msg: errors.ERR_ACC_DOESNT_EXIST, code: Account.ERR_ACC_DOESNT_EXIST.value};
    },

    loginToken: async (socket, mdb, token) => {
        const schemaResult = decideAccountTokenSchemaResult(token);

        if(schemaResult) return schemaResult;

        const tokens = await utilities.listDocuments(mdb, 'tokens');

        let tokenFound = false;
        let accountId;

        tokens.forEach(async (tokenItem) => {
            delete tokenItem._id;

            const targetToken = Object.keys(tokenItem)[0];

            if(targetToken === token) {
                tokenFound = true;
                accountId = tokenItem[targetToken]['accountId'];
                return;
            }
        });

        if(tokenFound) {
            await utilities.loginSocket(socket, mdb, accountId);
            return [];
        }
        else return {msg: errors.ERR_INVALID_TOKEN, code: Account.ERR_INVALID_TOKEN.value};
    }
}
