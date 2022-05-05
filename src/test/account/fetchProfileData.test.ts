// ******************** //
// The test file for the fetchProfileData event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertNotEqual,
    assertType,
    generateProfileId,
} from 'test/utilities';

function lengthProfileIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfileData',
        {
            profileId: generateProfileId(4),
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
            profileId: generateProfileId(15),
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
            profileId: generateProfileId(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'PROFILE_NOT_FOUND'));
        }
    );
}

function fetchProfileData(
    { socket, done, shared }: TestArguments,
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
                assertType({ email: profileData.email }, 'string') ||
                    assertType({ username: profileData.username }, 'string') ||
                    assertNotEqual(
                        { creationDate: new Date(profileData.creationDate) },
                        'Invalid Date'
                    )
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
