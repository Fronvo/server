// ******************** //
// The register no-account-only event file.
// ******************** //

const { decideAccountSchemaResult } = require('./shared');
const variables = require('../../other/variables');
const utilities = require('../../other/utilities');
const errors = require('../../other/errors');
const { enums } = require('../../other/enums');
const bcrypt = require('bcrypt');

async function register({ io, socket, email, password }) {
    // Schema validation
    const schemaResult = decideAccountSchemaResult(email, password);
    if(schemaResult) return schemaResult;

    // Check if the email is from a dummy (blacklisted) domain, if applicable
    if(variables.blacklistedEmailDomainsEnabled) {
        if(variables.blacklistedEmailDomains.indexOf(utilities.getEmailDomain(email)) > -1) {
            return utilities.generateError(errors.ERR_INVALID_EMAIL, enums.ERR_INVALID_EMAIL);
        }
    }

    const accounts = await utilities.listDocuments('accounts');
    
    // Check if the email is already registered by another user
    for(const account in accounts) {
        if(utilities.getAccountData(accounts, account).email == email) {
            return utilities.generateError(errors.ERR_ACC_ALR_EXISTS, enums.ERR_ACC_ALR_EXISTS);
        }
    }

    // Generate the account once all checks have passed
    const accountData = {};
    const accountUsername = 'Fronvo user ' + (accounts != null ? Object.keys(accounts).length + 1 : '1');
    const accountId = utilities.convertToId(accountUsername);

    accountData[accountId] = {
        username: accountUsername,
        email: email,
        password: !variables.testMode ? bcrypt.hashSync(password, variables.mainBcryptHash) : password,
        creationDate: new Date(),
    };
    
    await utilities.insertToCollection('accounts', accountData);
    
    // Also login to the account
    utilities.loginSocket(io, socket, accountId);

    return {token: await utilities.createToken(accountId)};
}

module.exports = register;
