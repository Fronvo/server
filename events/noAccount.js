// ******************** //
// Events which are only usable while not logged in.
// ******************** //

const utilities = require('../other/utilities');
const { getAccountData, getAccountId, getTokenAccountId, getTokenKey } = require('../other/utilities');
const schemas = require('../other/schemas');
const errors = require('../other/errors');
const { defaultError } = require('../other/variables');
const { JoiE, enums } = require('../other/enums');
const { format } = require('util');
const bcrypt = require('bcrypt');
const variables = require('../other/variables');
const { accountSchema } = require('../other/schemas');

function getMinMaxEntriesForAccounts() {
    let resultDict = {email: {}, password: {}};

    for(const [key, value] of accountSchema._ids._byKey.entries()) {
        if(!(key === 'email' || key === 'password')) continue;

        for(const [_, value2] of value.schema._singleRules.entries()) {
            if(!(value2.name === 'min' || value2.name === 'max')) continue;

            resultDict[key][value2.name] = value2.args.limit;
        }
    };

    return resultDict;
}

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

    // Default dictionary to reuse, copy its values
    let resultDict = {...defaultError};

    // Default to JOI message
    resultDict.msg = schemaMessage;

    if(schemaPath === 'email' || schemaPath === 'password') {

        // Provide additional info for the end user
        resultDict['extras'] = {for: schemaPath};

        let limits = getMinMaxEntriesForAccounts();

        switch(schemaType) {

            // Fall-through, reuse
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

    return {err: {...resultDict}};
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

    return {err: {...resultDict}};
}

async function register({ io, socket, mdb, email, password }) {
    // Schema validation
    const schemaResult = decideAccountSchemaResult(email, password);
    if(schemaResult) return schemaResult;

    // Check if the email is from a dummy (blacklisted) domain, if applicable
    if(variables.blacklistedEmailDomainsEnabled) {
        if(variables.blacklistedEmailDomains.indexOf(utilities.getEmailDomain(email)) > -1) {
            return {err: {msg: errors.ERR_INVALID_EMAIL, code: enums.ERR_INVALID_EMAIL}};
        }
    }

    const accounts = await utilities.listDocuments(mdb, 'accounts');
    
    // Check if the email is already registered by another user
    for(let account in accounts) {
        if(utilities.getAccountData(accounts, account).email == email) {
            return {err: {msg: errors.ERR_ACC_ALR_EXISTS, code: enums.ERR_ACC_ALR_EXISTS}};
        }
    }

    // Generate the account once all checks have passed
    const accountData = {};
    const accountUsername = 'Fronvo user ' + (accounts != null ? Object.keys(accounts).length + 1 : '1');
    const accountId = utilities.convertToId(accountUsername);

    accountData[accountId] = {
        username: accountUsername,
        email: email,
        password: bcrypt.hashSync(password, variables.mainBcryptHash),
        creationDate: new Date(),
    };
    
    await utilities.insertToCollection(mdb, 'accounts', accountData);
    
    // Also login to the account
    utilities.loginSocket(io, socket, accountId);

    return {token: await utilities.createToken(mdb, accountId)};
}

async function login({ io, socket, mdb, email, password}) {
    // Schema validation
    const schemaResult = decideAccountSchemaResult(email, password);
    if(schemaResult) return schemaResult;

    const accounts = await utilities.listDocuments(mdb, 'accounts');

    // Check if the email already exists to be able to login
    for(let account in accounts) {
        const accountData = getAccountData(accounts, account);

        if(accountData.email == email) {
            // Validate the password, synchronously
            if(bcrypt.compareSync(password, accountData.password)) {
                const accountId = getAccountId(accounts, account);

                utilities.loginSocket(io, socket, accountId);

                // Refresh token / Use available one
                let accountToken = await utilities.getToken(mdb, accountId);
                if(!accountToken) accountToken = await utilities.createToken(mdb, accountId);

                return {token: accountToken};
            } else {
                return {err: {msg: errors.ERR_INVALID_PASSWORD, code: enums.ERR_INVALID_PASSWORD}};
            }
        }
    };

    return {err: {msg: errors.ERR_ACC_DOESNT_EXIST, code: enums.ERR_ACC_DOESNT_EXIST}};
}

async function loginToken({ io, socket, mdb, token }) {
    // Schema validation
    const schemaResult = decideAccountTokenSchemaResult(token);
    if(schemaResult) return schemaResult;
    
    const tokens = await utilities.listDocuments(mdb, 'tokens');

    for(let tokenItem in tokens) {
        if(token == getTokenKey(tokens, tokenItem)) {
            // Just login to the account
            utilities.loginSocket(io, socket, getTokenAccountId(tokens, tokenItem));
            return {};
        }
    }

    return {err: {msg: errors.ERR_INVALID_TOKEN, code: enums.ERR_INVALID_TOKEN}};
}

module.exports = { register, login, loginToken }
