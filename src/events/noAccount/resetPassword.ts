// ******************** //
// The resetPassword no-account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import bcrypt from 'bcrypt';
import { emailSchema } from 'events/shared';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    ResetPasswordResult,
    ResetPasswordServerParams,
} from 'interfaces/noAccount/resetPassword';
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
        return generateError('ACCOUNT_DOESNT_EXIST');
    }

    let sentCode: string;

    if (!variables.testMode) {
        // 6 digits [0-9]
        sentCode = utilities.generateNumbers(0, 9, 6);
    } else {
        sentCode = '123456';
    }

    utilities.sendEmail(email, 'Fronvo password reset code', [
        `Your password reset code is ${sentCode}`,
    ]);

    attachCodeListener(sentCode);

    // Here for better readability
    function attachCodeListener(sentCode: string): void {
        socket.on('resetPasswordVerify', ({ code }, callback) => {
            if (code != sentCode) {
                callback({
                    err: { ...utilities.generateError('INVALID_CODE').err },
                });
                return;
            }

            // Detach listener
            socket.removeAllListeners('resetPasswordVerify');

            // Attach last listener
            attachChangeListener();

            callback({ err: undefined });
        });
    }

    function attachChangeListener(): void {
        socket.on('resetPasswordFinal', async ({ newPassword }, callback) => {
            const passwordCheck = utilities.validateSchema(
                new StringSchema({
                    newPassword: {
                        minLength: 8,
                        maxLength: 90,
                    },
                }),
                { newPassword }
            );

            if (passwordCheck) {
                callback({ err: { ...passwordCheck.err } });
                return;
            }

            await prismaClient.account.update({
                where: {
                    email,
                },
                data: {
                    password: !variables.testMode
                        ? bcrypt.hashSync(newPassword, variables.mainBcryptHash)
                        : newPassword,
                },
            });

            // Revoke token (will be regenerated when someone logs in to the account)
            await revokeToken(account.profileId);

            // Notify user about password change
            sendEmail(email, 'Fronvo password reset', [
                'Your password on Fronvo has been reset',
                'You may need to re-login to your account on all associated devices',
            ]);

            // Detach listener
            socket.removeAllListeners('resetPasswordFinal');

            callback({ err: undefined });
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
};

export default resetPasswordTemplate;
