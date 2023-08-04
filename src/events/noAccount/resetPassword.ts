// ******************** //
// The resetPassword no-account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import bcrypt from 'bcrypt';
import { codeSchema, emailSchema, passwordSchema } from 'events/shared';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    ResetPasswordResult,
    ResetPasswordServerParams,
    ResetPasswordTestResult,
} from 'interfaces/noAccount/resetPassword';
import { ResetPasswordVerifyParams } from 'interfaces/noAccount/resetPasswordVerify';
import utilities from 'utilities/all';
import { generateError, revokeToken, sendEmail } from 'utilities/global';
import * as variables from 'variables/global';
import { prismaClient } from 'variables/global';

async function resetPassword({
    socket,
    email,
}: ResetPasswordServerParams): Promise<ResetPasswordResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            email,
        },
    });

    if (!account) {
        return generateError('ACCOUNT_404');
    }

    let sentCode: string;

    if (!variables.setupMode) {
        // 6 digits [0-9]
        sentCode = utilities.generateNumbers(0, 9, 6);
    } else {
        sentCode = '123456';
    }

    utilities.sendEmail(email, 'Fronvo password reset code', [
        `Your password reset code is ${sentCode}`,
    ]);

    socket.on(
        'resetPasswordVerify',
        async ({ code, password }: ResetPasswordVerifyParams, callback) => {
            const codeSchemaCheck = utilities.validateSchema(
                new StringSchema(codeSchema),
                {
                    code,
                }
            );

            if (codeSchemaCheck) {
                reportError(codeSchemaCheck, callback);
                return;
            }

            const passwordCheck = utilities.validateSchema(
                new StringSchema(passwordSchema),
                {
                    password,
                }
            );

            if (passwordCheck) {
                reportError(passwordCheck, callback);
                return;
            }

            if (code != sentCode) {
                reportError(
                    utilities.generateError('INVALID', undefined, ['code']),
                    callback
                );
                return;
            }

            // Detach listener
            socket.removeAllListeners('resetPasswordFinal');

            try {
            } catch (e) {
                await prismaClient.account.update({
                    where: {
                        email,
                    },
                    data: {
                        password: bcrypt.hashSync(
                            password,
                            variables.mainBcryptHash
                        ),
                    },
                });
            }

            // Revoke token (will be regenerated when someone logs in to the account)
            await revokeToken(account.profileId);

            // Notify user about password change
            sendEmail(email, 'Fronvo password reset', [
                'Your password on Fronvo has been reset',
                'You may need to re-login to your account on all associated devices',
            ]);

            callback({ err: undefined });
        }
    );

    function reportError(
        err: FronvoError,
        callback: ({}: ResetPasswordTestResult) => any
    ) {
        if (!err) return;

        callback({
            err: { ...err.err },
        });
    }

    return {};
}

const resetPasswordTemplate: EventTemplate = {
    func: resetPassword,
    template: ['email'],
    schema: new StringSchema({
        ...emailSchema,
    }),
    dontFetchAccount: true,
};

export default resetPasswordTemplate;
