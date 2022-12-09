// ******************** //
// The test file for the fetchProfileData event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import shared from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertNotEqual,
    assertType,
    generateChars,
} from 'test/utilities';

function lengthProfileIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfileData',
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
        'fetchProfileData',
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

function profileNotFound(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfileData',
        {
            profileId: generateChars(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'PROFILE_NOT_FOUND'));
        }
    );
}

function fetchProfileData(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfileData',
        {
            profileId: shared.profileId,
        },
        ({ err, profileData }): void => {
            callback(assertError({ err }));

            callback(
                assertType({ id: profileData.profileId }, 'string') ||
                    assertType({ email: profileData.email }, 'string') ||
                    assertType({ username: profileData.username }, 'string') ||
                    assertType({ bio: profileData.bio }, 'string') ||
                    assertNotEqual(
                        { creationDate: new Date(profileData.creationDate) },
                        'Invalid Date'
                    ) ||
                    assertType(
                        { following: profileData.following },
                        'object'
                    ) ||
                    assertType(
                        { followers: profileData.followers },
                        'object'
                    ) ||
                    assertType({ avatar: profileData.avatar }, 'string') ||
                    assertType({ banner: profileData.banner }, 'string') ||
                    assertEquals({ isSelf: profileData.isSelf }, true)
            );

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthProfileIdMin,
            lengthProfileIdMax,
            profileNotFound,
        },
        testArgs,
        fetchProfileData
    );
};
