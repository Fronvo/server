// ******************** //
// The test file for the updateProfileData event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertType,
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

function lengthBioMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            bio: generateChars(129),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'bio')
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
            bio: generateChars(),
            avatar: `https://${generateChars()}`,
        },
        ({ err, profileData }): void => {
            callback(assertError({ err }));

            callback(
                assertType({ username: profileData.username }, 'string') ||
                    assertType({ bio: profileData.bio }, 'string') ||
                    assertType({ avatar: profileData.avatar }, 'string')
            );

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthUsernameMin,
            lengthUsernameMax,
            lengthBioMax,
            lengthAvatarMax,
        },
        testArgs,
        updateProfileData
    );
};
