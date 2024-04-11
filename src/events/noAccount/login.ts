// ******************** //
// The login no-account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { compareSync } from 'bcrypt';
import { emailSchema, passwordSchema, profileId } from 'events/shared';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { LoginResult, LoginServerParams } from 'interfaces/noAccount/login';
import * as utilities from 'utilities/global';
import { prismaClient } from 'variables/global';

async function login(
    { io, socket, email, password }: LoginServerParams,
    res: any
): Promise<LoginResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            email,
        },
    });

    if (!account) {
        return utilities.generateError('ACCOUNT_404');
    }

    // Validate the password, synchronously
    if (compareSync(password, account.password)) {
        utilities.loginSocket(io, socket, account.profileId);

        const token = await utilities.getToken(account.profileId);

        // Inform the email owner that someone has logged in, no extra info (unlike other platforms which give out your whole personal info)
        utilities.sendEmail(email, 'New login to Fronvo', [
            'Someone has logged in to your account on Fronvo',
            'You may want to take extra action incase you believe that your account has been compromised',
        ]);

        return { token };
    } else {
        return utilities.generateError('INVALID', undefined, ['password']);
    }
}

const loginTemplate: EventTemplate = {
    func: login,
    template: ['email', 'password'],
    schema: new StringSchema({
        ...emailSchema,
        ...passwordSchema,
    }),
    dontFetchAccount: true,
};

export default loginTemplate;
