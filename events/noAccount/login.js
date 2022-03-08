// ******************** //
// The login no-account-only event file.
// ******************** //

const { decideAccountSchemaResult } = require('./shared');
const utilities = require('../../other/utilities');
const errors = require('../../other/errors');
const { enums } = require('../../other/enums');
const bcrypt = require('bcrypt');
const variables = require('../../other/variables');

async function login({ io, socket, email, password}) {
    // Schema validation
    const schemaResult = decideAccountSchemaResult(email, password);
    if(schemaResult) return schemaResult;

    const accounts = await utilities.listDocuments('accounts');

    // Check if the email already exists to be able to login
    for(const account in accounts) {
        const accountData = utilities.getAccountData(accounts, account);

        if(accountData.email == email) {
            // Validate the password, synchronously
            if(!variables.testMode ? bcrypt.compareSync(password, accountData.password) : password == accountData.password) {
                const accountId = utilities.getAccountId(accounts, account);

                utilities.loginSocket(io, socket, accountId);

                // Refresh token / Use available one
                let accountToken = await utilities.getToken(accountId);
                if(!accountToken) accountToken = await utilities.createToken(accountId);

                return {token: accountToken};
            } else {
                return {err: {msg: errors.ERR_INVALID_PASSWORD, code: enums.ERR_INVALID_PASSWORD}};
            }
        }
    };

    return {err: {msg: errors.ERR_ACC_DOESNT_EXIST, code: enums.ERR_ACC_DOESNT_EXIST}};
}

module.exports = { func: login }
