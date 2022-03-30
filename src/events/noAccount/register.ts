// ******************** //
// The register no-account-only event file.
// ******************** //

import { AccountData } from '@prisma/client';
import bcrypt from 'bcrypt';
import { decideAccountSchemaResult } from 'events/noAccount/shared';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { RegisterResult, RegisterServerParams } from 'interfaces/noAccount/register';
import { enums } from 'other/enums';
import { ERR_ACC_ALR_EXISTS, ERR_INVALID_EMAIL } from 'other/errors';
import * as variables from 'other/variables';
import utilities from 'utilities/all';
import { findDocuments } from 'utilities/global';

async function register({ io, socket, email, password }: RegisterServerParams): Promise<RegisterResult | FronvoError> {
    // Schema validation
    const schemaResult = decideAccountSchemaResult(email, password);
    if(schemaResult) return schemaResult;

    // Check if the email is from a dummy (blacklisted) domain, if applicable
    if(variables.blacklistedEmailDomainsEnabled) {
        if(variables.blacklistedEmailDomains.indexOf(utilities.getEmailDomain(email)) > -1) {
            return utilities.generateError(ERR_INVALID_EMAIL, enums.ERR_INVALID_EMAIL);
        }
    }

    const accounts: {accountData: AccountData}[] = await findDocuments('Account', {select: {accountData: true}});

    // Check if the email is already registered by another user
    for(const account in accounts) {
        const accountData = accounts[account].accountData;

        if(accountData.email == email) {
            return utilities.generateError(ERR_ACC_ALR_EXISTS, enums.ERR_ACC_ALR_EXISTS);
        }
    }
    
    // Generate the account once all checks have passed
    const username = 'Fronvo user ' + (accounts != null ? Object.keys(accounts).length + 1 : '1');
    const id = utilities.convertToId(username);

    await utilities.createAccount({
        id,
        email,
        username,
        password: !variables.testMode ? bcrypt.hashSync(password, variables.mainBcryptHash) : password
    });
    
    // Also login to the account
    utilities.loginSocket(io, socket, id);

    return {token: await utilities.createToken(id)};
}

const registerTemplate: EventTemplate = {
    func: register,
    template: ['email', 'password'],
    points: 5
};

export default registerTemplate;
