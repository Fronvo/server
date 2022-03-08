// ******************** //
// The loginToken no-account-only event file.
// ******************** //

const { decideAccountTokenSchemaResult } = require('./shared');
const utilities = require('../../other/utilities');
const { getTokenKey, getTokenAccountId } = require('../../other/utilities');
const errors = require('../../other/errors');
const { enums } = require('../../other/enums');

async function loginToken({ io, socket, token }) {
    // Schema validation
    const schemaResult = decideAccountTokenSchemaResult(token);
    if(schemaResult) return schemaResult;
    
    const tokens = await utilities.listDocuments('tokens');

    for(const tokenItem in tokens) {
        if(token == getTokenKey(tokens, tokenItem)) {
            // Just login to the account
            utilities.loginSocket(io, socket, getTokenAccountId(tokens, tokenItem));
            return {};
        }
    }

    return {err: {msg: errors.ERR_INVALID_TOKEN, code: enums.ERR_INVALID_TOKEN}};
}

module.exports = { func: loginToken }
