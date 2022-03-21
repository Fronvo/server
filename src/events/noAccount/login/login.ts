// ******************** //
// The login no-account-only event file.
// ******************** //

import { compareSync } from 'bcrypt';
import { enums } from 'other/enums';
import { ERR_ACC_DOESNT_EXIST, ERR_INVALID_PASSWORD } from 'other/errors';
import { Account, Error } from 'other/interfaces';
import * as utilities from 'other/utilities';
import { testMode } from 'other/variables';
import { Login, LoginResult } from './interfaces';
import { decideAccountSchemaResult } from '../shared';

export default async function login({ io, socket, email, password}: Login): Promise<LoginResult | Error> {
    // Schema validation
    const schemaResult = decideAccountSchemaResult(email, password);
    if(schemaResult) return schemaResult;

    const accounts: Account[] = await utilities.listDocuments('accounts');

    // Check if the email already exists to be able to login
    for(const account in accounts) {
        const accountData = utilities.getAccountData(accounts, account);

        if(accountData.email == email) {
            // Validate the password, synchronously
            if(!testMode ? compareSync(password, accountData.password) : password == accountData.password) {
                const accountId = utilities.getAccountId(accounts, account);

                utilities.loginSocket(io, socket, accountId);

                // Refresh token / Use available one
                let accountToken = await utilities.getToken(accountId);
                if(!accountToken) accountToken = await utilities.createToken(accountId);

                return {token: accountToken};
            } else {
                return utilities.generateError(ERR_INVALID_PASSWORD, enums.ERR_INVALID_PASSWORD);
            }
        }
    };

    return utilities.generateError(ERR_ACC_DOESNT_EXIST, enums.ERR_ACC_DOESNT_EXIST);
}
