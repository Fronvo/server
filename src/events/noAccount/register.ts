// ******************** //
// The register no-account-only event file.
// ******************** //

import bcrypt from 'bcrypt';
import { enums } from 'other/enums';
import { ERR_ACC_ALR_EXISTS, ERR_INVALID_EMAIL } from 'other/errors';
import { Account, Error } from 'other/interfaces';
import * as utilities from 'other/utilities';
import * as variables from 'other/variables';
import { Register, RegisterResult } from './interfaces';
import { decideAccountSchemaResult } from './shared';

export default async function register({ io, socket, email, password }: Register): Promise<RegisterResult | Error> {
    // Schema validation
    const schemaResult = decideAccountSchemaResult(email, password);
    if(schemaResult) return schemaResult;

    // Check if the email is from a dummy (blacklisted) domain, if applicable
    if(variables.blacklistedEmailDomainsEnabled) {
        if(variables.blacklistedEmailDomains.indexOf(utilities.getEmailDomain(email)) > -1) {
            return utilities.generateError(ERR_INVALID_EMAIL, enums.ERR_INVALID_EMAIL);
        }
    }

    const accounts: Account[] = await utilities.listDocuments('accounts');
    
    // Check if the email is already registered by another user
    for(const account in accounts) {
        if(utilities.getAccountData(accounts, account).email == email) {
            return utilities.generateError(ERR_ACC_ALR_EXISTS, enums.ERR_ACC_ALR_EXISTS);
        }
    }

    // Generate the account once all checks have passed
    const accountUsername = 'Fronvo user ' + (accounts != null ? Object.keys(accounts).length + 1 : '1');
    const accountId = utilities.convertToId(accountUsername);

    const accountData: {[accountId: string]: Account} = {};

    accountData[accountId] = {
        username: accountUsername,
        email: email,
        password: !variables.testMode ? bcrypt.hashSync(password, variables.mainBcryptHash) : password,
        creationDate: new Date()
    };
    
    await utilities.insertToCollection('accounts', accountData);
    
    // Also login to the account
    utilities.loginSocket(io, socket, accountId);

    return {token: await utilities.createToken(accountId)};
}
