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

function lengthBannerMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileData',
        {
            banner: `https://${generateChars(513)}`,
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'banner')
            );
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
            banner: `https://${generateChars()}`,
        },
        ({ err, profileData }): void => {
            callback(assertError({ err }));

            callback(
                assertType({ profileId: profileData.profileId }, 'string') ||
                    assertType({ username: profileData.username }, 'string') ||
                    assertType({ bio: profileData.bio }, 'string') ||
                    assertType({ avatar: profileData.avatar }, 'string') ||
                    assertType({ banner: profileData.banner }, 'string')
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
            lengthUsernameMax,
            lengthBioMax,
            lengthAvatarMax,
            lengthBannerMax,
            invalidProfileId,
        },
        testArgs,
        updateProfileData
    );
};
