// ******************** //
// The login no-account-only event file.
// ******************** //

import { compareSync } from 'bcrypt';
import { accountSchema } from 'events/noAccount/shared';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { LoginResult, LoginServerParams } from 'interfaces/noAccount/login';
import * as utilities from 'utilities/global';
import { prismaClient, testMode } from 'variables/global';

async function login({
    io,
    socket,
    email,
    password,
}: LoginServerParams): Promise<LoginResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            email,
        },
    });

    if (!account) {
        return utilities.generateError('ACCOUNT_DOESNT_EXIST');
    }

    // Validate the password, synchronously
    if (
        !testMode
            ? compareSync(password, account.password)
            : password == account.password
    ) {
        utilities.loginSocket(io, socket, account.profileId);

        const token = await utilities.getToken(account.profileId);

        // Inform the email owner that someone has logged in, no extra info (unlike other platforms which give out your whole personal info)
        utilities.sendEmail(email, 'New login to your account on Fronvo', [
            'Someone has logged in to your account on Fronvo',
            'You may want to take extra action incase you believe that your account has been compromised',
        ]);

        return { token };
    } else {
        return utilities.generateError('INVALID_PASSWORD');
    }
}

const loginTemplate: EventTemplate = {
    func: login,
    template: ['email', 'password'],
    points: 5,
    schema: accountSchema,
};

export default loginTemplate;
