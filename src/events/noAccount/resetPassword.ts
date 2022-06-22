// ******************** //
// The resetPassword no-account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { AccountData } from '@prisma/client';
import bcrypt from 'bcrypt';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    ResetPasswordResult,
    ResetPasswordServerParams,
} from 'interfaces/noAccount/resetPassword';
import utilities from 'utilities/all';
import { sendEmail } from 'utilities/global';
import * as variables from 'variables/global';

async function resetPassword({
    socket,
    email,
}: ResetPasswordServerParams): Promise<ResetPasswordResult | FronvoError> {
    // Check if the email exists
    let emailFound = false;

    const accounts: { accountData: AccountData }[] =
        await utilities.findDocuments('Account', {
            select: { accountData: true },
        });

    for (const account in accounts) {
        const accountData = accounts[account].accountData;

        if (accountData.email === email) {
            // Remove default error
            emailFound = true;

            // Send a password reset code email
            let sentCode: string;

            if (!variables.testMode) {
                // 6 digits [0-9]
                sentCode = utilities.generateNumbers(0, 9, 6);

                // Send the code
                utilities.sendEmail(email, 'Fronvo password reset code', [
                    `Your password reset code is ${sentCode}`,
                ]);
            } else {
                sentCode = '123456';
            }

            attachCodeListener(sentCode);
        }
    }

    // Here for better readability
    function attachCodeListener(sentCode: string): void {
        socket.on('resetPasswordVerify', ({ code }, callback) => {
            let finalError: FronvoError;

            if (code != sentCode) {
                finalError = utilities.generateError('INVALID_CODE');
            } else {
                // Detach listener
                socket.removeAllListeners('resetPasswordVerify');

                // Attach last listener
                attachChangeListener();
            }

            callback({
                err: finalError ? { ...finalError.err } : undefined,
            });
        });
    }

    function attachChangeListener(): void {
        socket.on('resetPasswordFinal', async ({ newPassword }, callback) => {
            // Validate password
            let finalError: FronvoError;

            const passwordCheck = utilities.validateSchema(
                new StringSchema({
                    newPassword: {
                        minLength: 8,
                        maxLength: 30,
                        regex: /^[a-zA-Z0-9]+$/,
                    },
                }),
                { newPassword }
            );

            if (passwordCheck) {
                finalError = passwordCheck;
            } else {
                // Update password
                await utilities.updateAccount(
                    {
                        password: !variables.testMode
                            ? bcrypt.hashSync(
                                  newPassword,
                                  variables.mainBcryptHash
                              )
                            : newPassword,
                    },
                    { email }
                );

                // Notify user about password change
                sendEmail(email, 'Fronvo password reset', [
                    'Your password on Fronvo has been reset',
                    'You may need to re-login to your account on all associated devices',
                ]);

                // Detach listener
                socket.removeAllListeners('resetPasswordFinal');
            }

            callback({
                err: finalError ? { ...finalError.err } : undefined,
            });
        });
    }

    if (!emailFound) {
        return utilities.generateError('ACCOUNT_DOESNT_EXIST');
    } else {
        return {};
    }
}

const resetPasswordTemplate: EventTemplate = {
    func: resetPassword,
    template: ['email'],
    points: 5,
    schema: new StringSchema({
        email: {
            minLength: 8,
            maxLength: 60,
            type: 'email',
        },
    }),
};

export default resetPasswordTemplate;
