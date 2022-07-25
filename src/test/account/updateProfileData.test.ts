// ******************** //
// The test file for the updateProfileData event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    generateChars,
} from 'test/utilities';

function lengthUsernameMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            username: generateChars(4),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'username')
            );
        }
    );
}

function lengthUsernameMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            username: generateChars(31),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'username')
            );
        }
    );
}

function lengthAvatarMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            avatar: `https://${generateChars(513)}`,
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'avatar')
            );
        }
    );
}

function updateProfileData(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            username: generateChars(),
            avatar: `https://${generateChars()}`,
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
            lengthUsernameMin,
            lengthUsernameMax,
            lengthAvatarMax,
        },
        testArgs,
        updateProfileData
    );
};
