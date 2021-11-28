const utilities = require('../other/utilities');
const schemas = require('../other/schemas');
const errors = require('../other/errors');
const { defaultError } = require('../other/variables');
const { JoiE, enums } = require('../other/enums');
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
            case JoiE.TYPE_REQUIRED:
            case JoiE.TYPE_EMPTY:
                resultDict.msg = format(errors.ERR_REQUIRED, schemaPath);
                resultDict.code = enums.ERR_REQUIRED;
                break;

            case JoiE.TYPE_MIN:
            case JoiE.TYPE_MAX:
                resultDict.msg = format(errors.ERR_LENGTH, schemaPath, limits[schemaPath].min, limits[schemaPath].max);
                resultDict.code = enums.ERR_LENGTH;
                resultDict.extras['min'] = limits[schemaPath].min;
                resultDict.extras['max'] = limits[schemaPath].max;
                break;

            case JoiE.TYPE_INVALID_EMAIL_FORMAT:
                resultDict.msg = errors.ERR_INVALID_EMAIL_FORMAT;
                resultDict.code = enums.ERR_INVALID_EMAIL_FORMAT;
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
        case JoiE.TYPE_REQUIRED:
        case JoiE.TYPE_EMPTY:
            resultDict.msg = format(errors.ERR_REQUIRED, 'token');
            resultDict.code = enums.ERR_REQUIRED;
            break;

        case JoiE.TYPE_LENGTH:
            resultDict.msg = format(errors.ERR_EXACT_LENGTH, 'token', 36);
            resultDict.code = enums.ERR_EXACT_LENGTH;
            break;

        case JoiE.TYPE_REGEX:
            resultDict.msg = format(errors.ERR_INVALID_REGEX, 'token');
            resultDict.code = enums.ERR_INVALID_REGEX;
            break;
    }

    return resultDict;
}

module.exports = {
    register: async (socket, mdb, email, password) => {
        const schemaResult = decideAccountSchemaResult(email, password);

        if(schemaResult) return schemaResult;

        const accounts = await utilities.listDocuments(mdb, 'accounts');

        // check if the email is already registered
        for(let account in accounts) {
            account = accounts[account];
            const accountDict = account[Object.keys(account)[0]];

            if(accountDict.email == email) {
                return {msg: errors.ERR_ACC_ALR_EXISTS, code: enums.ERR_ACC_ALR_EXISTS};
            }
        }

        // generate the account
        const accountData = {};
        const accountId = utilities.generateId();

        accountData[accountId] = {
            username: 'Fronvo User ' + (accounts.length + 1),
            email: email,
            password: bcrypt.hashSync(password, variables.mainBcryptHash),
            creationDate: new Date(),
        };
        
        await mdb.collection('accounts').insertOne(accountData);
        
        utilities.loginSocket(socket, accountId);

        return [null, await utilities.createToken(mdb, accountId)];
    },

    login: async (socket, mdb, email, password) => {
        const schemaResult = decideAccountSchemaResult(email, password);

        if(schemaResult) return schemaResult;

        const accounts = await utilities.listDocuments(mdb, 'accounts');

        // check if the email exists
        for(let account in accounts) {
            account = accounts[account];

            const accountId = Object.keys(account)[0];
            const accountDict = account[accountId];

            if(accountDict.email == email) {
                // validate the password, leave as sync, only one to compare against, no time gain
                if(bcrypt.compareSync(password, accountDict.password)) {
                    utilities.loginSocket(socket, accountId);

                    let accountToken = await utilities.getToken(mdb, accountId);

                    if(!accountToken) accountToken = await utilities.createToken(mdb, accountId);

                    return [null, accountToken];
                } else {
                    return {msg: errors.ERR_INVALID_PASSWORD, code: enums.ERR_INVALID_PASSWORD};
                }
            }
        };

        return {msg: errors.ERR_ACC_DOESNT_EXIST, code: enums.ERR_ACC_DOESNT_EXIST};
    },

    loginToken: async (socket, mdb, token) => {
        const schemaResult = decideAccountTokenSchemaResult(token);

        if(schemaResult) return schemaResult;
        
        const tokens = await utilities.listDocuments(mdb, 'tokens');

        for(let tokenItem in tokens) {
            tokenItem = tokens[tokenItem];
            const tokenAccountId = Object.keys(tokenItem)[0];
            const tokenKey = tokenItem[tokenAccountId];

            if(token == tokenKey) return [];
        }

        return {msg: errors.ERR_INVALID_TOKEN, code: enums.ERR_INVALID_TOKEN};
    }
}
