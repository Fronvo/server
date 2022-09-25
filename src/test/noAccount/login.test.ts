// ******************** //
// The test file for the login event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertLength,
    assertType,
    generateChars,
    generateEmail,
    generatePassword,
} from 'test/utilities';

function requiredEmail(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'login',
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
        'login',
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
        'login',
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
        'login',
        {
            email: generateChars(120) + '@gmail.com',
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
        'login',
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
        'login',
        {
            email: generateEmail(),
            password: generateChars(91),
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
        'login',
        {
            email: generateEmail().replace(/@/, ''),
            password: generatePassword(),
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
        'login',
        {
            email: generateEmail(),
            password: generatePassword(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'ACCOUNT_DOESNT_EXIST'));
        }
    );
}

function invalidPassword(
    { socket, shared }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'login',
        {
            email: shared.email,
            password: generatePassword(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'INVALID_PASSWORD'));
        }
    );
}

function login(
    { socket, done, shared }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'login',
        {
            email: shared.email,
            password: shared.password,
        },
        ({ err, token }): void => {
            callback(assertError({ err }));

            callback(
                assertType({ token }, 'string') || assertLength({ token }, 36)
            );

            socket.emit('logout', () => {
                done();
            });
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
            accountDoesntExist,
            invalidPassword,
        },
        testArgs,
        login
    );
};
