// ******************** //
// The test file for the register event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import sharedVars from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertLength,
    assertType,
    generateEmail,
    generatePassword,
} from 'test/utilities';

function requiredEmail(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'register',
        {
            email: '',
            password: generatePassword(),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'REQUIRED') ||
                    assertEquals({ for: err.extras.for }, 'email')
            );
        }
    );
}

function requiredPassword(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'register',
        {
            email: generateEmail(),
            password: '',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'REQUIRED') ||
                    assertEquals({ for: err.extras.for }, 'password')
            );
        }
    );
}

function lengthEmailMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'register',
        {
            email: generateEmail().substring(0, 1) + '@g.co',
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

function lengthEmailMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'register',
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

function lengthPasswordMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'register',
        {
            email: generateEmail(),
            password: generatePassword().substring(0, 7),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'password')
            );
        }
    );
}

function lengthPasswordMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'register',
        {
            email: generateEmail(),
            password: generatePassword() + generatePassword(),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'password')
            );
        }
    );
}

function invalidEmailFormat(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'register',
        {
            email: generateEmail().replace(/@/, ''),
            password: generatePassword(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'REQUIRED_EMAIL'));
        }
    );
}

function accountExists(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    const existsEmail = generateEmail();
    const existsPassword = generatePassword();

    socket.emit(
        'register',
        {
            email: existsEmail,
            password: existsPassword,
        },
        () => {
            socket.emit('logout');

            socket.emit(
                'register',
                {
                    email: existsEmail,
                    password: existsPassword,
                },
                ({ err }) => {
                    callback(assertCode(err.code, 'ACCOUNT_ALREADY_EXISTS'));
                }
            );
        }
    );
}

function register(
    { socket, done, shared }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('logout');

    socket.emit(
        'register',
        {
            email: shared.email,
            password: shared.password,
        },
        ({ err, token }): void => {
            callback(assertError({ err }));

            callback(
                assertType({ token }, 'string') || assertLength({ token }, 36)
            );

            sharedVars.token = token;
            socket.emit('logout');
            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            requiredEmail,
            requiredPassword,
            lengthEmailMin,
            lengthEmailMax,
            lengthPasswordMin,
            lengthPasswordMax,
            invalidEmailFormat,
            accountExists,
        },
        testArgs,
        register
    );
};
