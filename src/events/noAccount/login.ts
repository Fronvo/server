// ******************** //
// The login no-account-only event file.
// ******************** //

import { AccountData } from '@prisma/client';
import { compareSync } from 'bcrypt';
import { accountSchema } from 'events/noAccount/shared';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { LoginResult, LoginServerParams } from 'interfaces/noAccount/login';
import { testMode } from 'variables/global';
import * as utilities from 'utilities/global';

async function login({
    io,
    socket,
    email,
    password,
}: LoginServerParams): Promise<LoginResult | FronvoError> {
    const accounts: { accountData: AccountData }[] =
        await utilities.findDocuments('Account', {
            select: { accountData: true },
        });

    // Check if the email already exists to be able to login
    for (const account in accounts) {
        const accountData = accounts[account].accountData;

        if (accountData.email == email) {
            // Validate the password, synchronously
            if (
                !testMode
                    ? compareSync(password, accountData.password)
                    : password == accountData.password
            ) {
                utilities.loginSocket(io, socket, accountData.id);

                // Refresh token / Use available one
                let accountToken = await utilities.getToken(accountData.id);
                if (!accountToken)
                    accountToken = await utilities.createToken(accountData.id);

                return {
                    token: accountToken,
                };
            } else {
                return utilities.generateError('INVALID_PASSWORD');
            }
        }
    }

    return utilities.generateError('ACCOUNT_DOESNT_EXIST');
}

const loginTemplate: EventTemplate = {
    func: login,
    template: ['email', 'password'],
    points: 5,
    schema: accountSchema,
};

export default loginTemplate;
