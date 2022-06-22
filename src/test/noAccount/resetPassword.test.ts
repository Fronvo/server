// ******************** //
// The test file for the resetPassword event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    generateEmail,
    generatePassword,
} from 'test/utilities';

function required(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'resetPassword',
        {
            email: '',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'REQUIRED') ||
                    assertEquals({ for: err.extras.for }, 'email')
            );
        }
    );
}

function lengthEmailMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'resetPassword',
        {
            email: generateEmail().substring(0, 1) + '@g.co',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'email')
            );
        }
    );
}

function lengthEmailMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'login',
        {
            email: generateEmail().replace(/@gmail.com/, '') + generateEmail(),
            password: generatePassword(),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'email')
            );
        }
    );
}

function invalidEmailFormat(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'resetPassword',
        {
            email: generateEmail().replace(/@/, ''),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'REQUIRED_EMAIL'));
        }
    );
}

function accountDoesntExist(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'resetPassword',
        {
            email: generateEmail(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'ACCOUNT_DOESNT_EXIST'));
        }
    );
}

function resetPassword(
    { socket, done, shared }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'resetPassword',
        {
            email: shared.email,
        },
        ({ err }): void => {
            callback(assertError({ err }));

            socket.emit(
                'resetPasswordVerify',
                { code: '123456' },
                ({ err }) => {
                    callback(assertError({ err }));

                    const newPassword = generatePassword();

                    socket.emit(
                        'resetPasswordFinal',
                        { newPassword },
                        ({ err }) => {
                            callback(assertError({ err }));

                            // Relogin with updated shared variable
                            shared.password = newPassword;

                            socket.emit(
                                'login',
                                {
                                    email: shared.email,
                                    password: shared.password,
                                },
                                ({ err, token }) => {
                                    callback(assertError({ err }));

                                    // Token is revoked, update
                                    shared.token = token;

                                    done();
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            required,
            lengthEmailMin,
            lengthEmailMax,
            invalidEmailFormat,
            accountDoesntExist,
        },
        testArgs,
        resetPassword
    );
};
