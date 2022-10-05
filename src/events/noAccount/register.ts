// ******************** //
// The register no-account-only event file.
// ******************** //

import bcrypt from 'bcrypt';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    RegisterResult,
    RegisterServerParams,
} from 'interfaces/noAccount/register';
import { generateChars } from 'test/utilities';
import utilities from 'utilities/all';
import * as variables from 'variables/global';
import { prismaClient } from 'variables/global';
import { accountSchema } from './shared';

async function register({
    io,
    socket,
    email,
    password,
}: RegisterServerParams): Promise<RegisterResult | FronvoError> {
    // Check if the email is from a dummy (blacklisted) domain, if applicable
    if (variables.blacklistedEmailDomainsEnabled) {
        if (
            variables.blacklistedEmailDomains.indexOf(
                utilities.getEmailDomain(email)
            ) > -1
        ) {
            return utilities.generateError('REQUIRED_EMAIL');
        }
    }

    const account = await prismaClient.account.findFirst({
        where: {
            email,
        },
    });

    // Check if the email is already registered by another user
    if (account) {
        return utilities.generateError('ACCOUNT_ALREADY_EXISTS');
    }

    let sentCode: string;

    if (!variables.testMode) {
        // 6 digits [0-9]
        sentCode = utilities.generateNumbers(0, 9, 6);
    } else {
        sentCode = '123456';
    }

    utilities.sendEmail(email, 'Fronvo email verification code', [
        `Your verification code is ${sentCode}`,
    ]);

    // Attach registerVerify now, will be detached after verification / discarded
    socket.on('registerVerify', async ({ code }, callback) => {
        let finalError: FronvoError;
        let token: string;

        if (code != sentCode) {
            finalError = utilities.generateError('INVALID_CODE');
        } else {
            // Detach listener
            socket.removeAllListeners('registerVerify');

            const username = `Fronvo user ${
                (await prismaClient.account.count()) + 1
            }`;

            // abcdef12345
            const profileId = generateChars(10);

            await prismaClient.account.create({
                data: {
                    profileId,
                    email,
                    password:
                        !variables.testMode || variables.setupMode
                            ? bcrypt.hashSync(
                                  password,
                                  variables.mainBcryptHash
                              )
                            : password,
                    username,
                    isPrivate: false,
                    following: [],
                    followers: [],
                },
            });

            token = await utilities.getToken(profileId);

            utilities.sendEmail(email, 'Welcome to Fronvo!', [
                "We're so glad to have you on our platform!",
                'Enjoy your stay on the safest social media!',
            ]);

            utilities.loginSocket(io, socket, profileId);
        }

        callback({
            token: !finalError ? token : undefined,
            err: finalError ? { ...finalError.err } : undefined,
        });
    });

    return {};
}

const registerTemplate: EventTemplate = {
    func: register,
    template: ['email', 'password'],
    schema: accountSchema,
};

export default registerTemplate;
