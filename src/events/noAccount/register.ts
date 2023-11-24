// ******************** //
// The register no-account-only event file.
// ******************** //

import bcrypt from 'bcrypt';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { RegisterResult } from 'interfaces/noAccount/register';
import utilities from 'utilities/all';
import * as variables from 'variables/global';
import { prismaClient } from 'variables/global';
import { StringSchema } from '@ezier/validate';
import {
    codeSchema,
    emailSchema,
    passwordSchema,
    profileIdSchema,
} from 'events/shared';
import { encryptAES, validateSchema } from 'utilities/global';
import {
    RegisterVerifyParams,
    RegisterVerifyTestResult,
} from 'interfaces/noAccount/registerVerify';

async function register({
    io,
    socket,
    email,
    password,
}): Promise<RegisterResult | FronvoError> {
    // Check if the email is from a dummy (blacklisted) domain, if applicable
    if (variables.blacklistedEmailDomainsEnabled) {
        if (
            variables.blacklistedEmailDomains.indexOf(
                utilities.getEmailDomain(email)
            ) > -1
        ) {
            return utilities.generateError('REQUIRED', undefined, ['email']);
        }
    }

    const account = await prismaClient.account.findFirst({
        where: {
            email,
        },
    });

    // Check if the email is already registered by another user
    if (account) {
        return utilities.generateError('EMAIL_TAKEN');
    }

    let sentCode: string;

    if (!variables.setupMode) {
        // 6 digits [0-9]
        sentCode = utilities.generateNumbers(0, 9, 6);
    } else {
        sentCode = '123456';
    }

    utilities.sendEmail(email, 'Fronvo email verification code', [
        `Your verification code is ${sentCode}`,
    ]);

    // Attach registerVerify now, will be detached after verification / discarded
    socket.on(
        'registerVerify',
        async (
            { code, profileId }: RegisterVerifyParams,
            callback: ({}: RegisterVerifyTestResult) => void
        ) => {
            const codeSchemaCheck = validateSchema(
                new StringSchema(codeSchema),
                {
                    code,
                }
            );

            if (codeSchemaCheck) {
                reportError(codeSchemaCheck, callback);
                return;
            }

            if (code != sentCode) {
                reportError(
                    utilities.generateError('INVALID', undefined, ['code']),
                    callback
                );
                return;
            }

            const profileSchemaCheck = validateSchema(
                new StringSchema(profileIdSchema),
                { profileId }
            );

            if (profileSchemaCheck) {
                reportError(profileSchemaCheck, callback);
                return;
            }

            // Check for email and identifier
            const account = await prismaClient.account.findFirst({
                where: {
                    email,
                },
            });

            if (account) {
                reportError(utilities.generateError('EMAIL_TAKEN'), callback);
                return;
            }

            const account2 = await prismaClient.account.findFirst({
                where: {
                    profileId,
                },
            });

            if (account2) {
                reportError(utilities.generateError('ID_TAKEN'), callback);
                return;
            }

            // Detach listener
            socket.removeAllListeners('registerVerify');

            const username = 'Fronvo user';

            await prismaClient.account.create({
                data: {
                    profileId,
                    email,
                    password: bcrypt.hashSync(
                        password,
                        variables.mainBcryptHash
                    ),
                    username,
                    friends: [],
                    isPRO: false,
                },
            });

            const token = await utilities.getToken(profileId);

            utilities.sendEmail(email, 'Welcome to Fronvo!', [
                "We're so glad to have you on our platform!",
                'Enjoy your stay on the safest social media!',
            ]);

            utilities.loginSocket(io, socket, profileId);

            callback({ token, err: undefined });
        }
    );

    function reportError(
        err: FronvoError,
        callback: ({}: RegisterVerifyTestResult) => any
    ) {
        if (!err) return;

        callback({
            err: { ...err.err },
            token: undefined,
        });
    }

    return {};
}

const registerTemplate: EventTemplate = {
    func: register,
    template: ['email', 'password'],
    schema: new StringSchema({
        ...emailSchema,
        ...passwordSchema,
    }),
    dontFetchAccount: true,
};

export default registerTemplate;
