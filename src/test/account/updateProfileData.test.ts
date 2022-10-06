// ******************** //
// The test file for the updateProfileData event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import shared, { setTestVariable } from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertType,
    generateChars,
} from 'test/utilities';

function lengthProfileIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            profileId: generateChars(4),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'profileId')
            );
        }
    );
}

function lengthProfileIdMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            profileId: generateChars(31),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'profileId')
            );
        }
    );
}

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

function invalidIsPrivate(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            // @ts-ignore
            isPrivate: '123',
        },
        ({ err }) => {
            callback(assertCode(err.code, 'NOT_BOOLEAN'));
        }
    );
}

function invalidProfileId(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            profileId: shared.profileId,
        },
        ({ err }) => {
            callback(assertCode(err.code, 'INVALID_PROFILE_ID'));
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
            profileId: generateChars(),
            username: generateChars(),
            bio: generateChars(),
            avatar: `https://${generateChars()}`,
            isPrivate: false,
        },
        ({ err, profileData }): void => {
            callback(assertError({ err }));

            callback(
                assertType({ profileId: profileData.profileId }, 'string') ||
                    assertType({ username: profileData.username }, 'string') ||
                    assertType({ bio: profileData.bio }, 'string') ||
                    assertType({ avatar: profileData.avatar }, 'string')
            );

            setTestVariable('profileId', profileData.profileId);

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthProfileIdMin,
            lengthProfileIdMax,
            lengthUsernameMin,
            lengthUsernameMax,
            lengthBioMax,
            lengthAvatarMax,
            invalidIsPrivate,
            invalidProfileId,
        },
        testArgs,
        updateProfileData
    );
};
