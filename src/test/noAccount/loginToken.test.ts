// ******************** //
// The test file for the loginToken event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
} from 'test/utilities';
import { v4 } from 'uuid';

function required(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'loginToken',
        {
            token: '',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'REQUIRED') ||
                    assertEquals({ for: err.extras.for }, 'token')
            );
        }
    );
}

function invalidTokenType(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'loginToken',
        {
            token: v4().replace(/-/, 'a'),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'REQUIRED_UUID') ||
                    assertEquals({ for: err.extras.for }, 'token')
            );
        }
    );
}

function invalidToken(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'loginToken',
        {
            token: v4(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'INVALID_TOKEN'));
        }
    );
}

function loginToken(
    { socket, done, shared }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'loginToken',
        {
            token: shared.token,
        },
        ({ err }): void => {
            callback(assertError({ err }));

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            required,
            invalidTokenType,
            invalidToken,
        },
        testArgs,
        loginToken
    );
};
