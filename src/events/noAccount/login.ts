// ******************** //
// The login no-account-only event file.
// ******************** //

import { compareSync } from 'bcrypt';
import { Account, FronvoError } from 'interfaces/all';
import { LoginResult, LoginServerParams } from 'interfaces/noAccount/login';
import { enums } from 'other/enums';
import { ERR_ACC_DOESNT_EXIST, ERR_INVALID_PASSWORD } from 'other/errors';
import * as utilities from 'other/utilities';
import { testMode } from 'other/variables';
import { decideAccountSchemaResult } from 'events/noAccount/shared';

export default async ({ io, socket, email, password}: LoginServerParams): Promise<LoginResult | FronvoError> => {
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
