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
import { emailSchema, passwordSchema } from 'events/shared';

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
    socket.on('registerVerify', async ({ code, identifier }, callback) => {
        let finalError: FronvoError;
        let token: string;

        if (code != sentCode) {
            finalError = utilities.generateError('INVALID', ['code']);
        } else {
            // Double-check if someone else registered this during verification
            let prematureFinalError: FronvoError;

            // Check for email and identifier
            const account = await prismaClient.account.findFirst({
                where: {
                    email,
                },
            });

            if (account) {
                prematureFinalError = utilities.generateError('EMAIL_TAKEN');
            }

            const account2 = await prismaClient.account.findFirst({
                where: {
                    profileId: identifier,
                },
            });

            if (account2) {
                prematureFinalError = utilities.generateError('ID_TAKEN');
            }

            if (prematureFinalError) {
                finalError = prematureFinalError;
            } else {
                // Detach listener
                socket.removeAllListeners('registerVerify');

                const username = `Fronvo user ${
                    (await prismaClient.account.count()) + 1
                }`;

                await prismaClient.account.create({
                    data: {
                        profileId: identifier,
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

                token = await utilities.getToken(identifier);

                utilities.sendEmail(email, 'Welcome to Fronvo!', [
                    "We're so glad to have you on our platform!",
                    'Enjoy your stay on the safest social media!',
                ]);

                utilities.loginSocket(io, socket, identifier);

                callback({
                    // May be undefined if not in setup
                    token,
                    err: finalError ? { ...finalError.err } : undefined,
                });
            }
        }
    });

    return {};
}

const registerTemplate: EventTemplate = {
    func: register,
    template: ['email', 'password'],
    schema: new StringSchema({
        ...emailSchema,
        ...passwordSchema,
    }),
};

export default registerTemplate;
