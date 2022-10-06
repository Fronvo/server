// ******************** //
// The test file for the followProfile event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import shared from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    generateChars,
} from 'test/utilities';

function lengthProfileIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'followProfile',
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
        'followProfile',
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
        'followProfile',
        {
            profileId: generateChars(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'PROFILE_NOT_FOUND'));
        }
    );
}

function followSelf(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'followProfile',
        {
            profileId: shared.profileId,
        },
        ({ err }) => {
            callback(assertCode(err.code, 'FOLLOW_SELF'));
        }
    );
}

function alreadyFollowing(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'followProfile',
        {
            profileId: shared.secondaryProfileId,
        },
        () => {
            socket.emit(
                'followProfile',
                {
                    profileId: shared.secondaryProfileId,
                },
                ({ err }) => {
                    socket.emit(
                        'unfollowProfile',
                        {
                            profileId: shared.secondaryProfileId,
                        },
                        () => {
                            callback(assertCode(err.code, 'ALREADY_FOLLOWING'));
                        }
                    );
                }
            );
        }
    );
}

function followProfile(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'followProfile',
        {
            profileId: shared.secondaryProfileId,
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
            lengthProfileIdMin,
            lengthProfileIdMax,
            profileNotFound,
            followSelf,
            alreadyFollowing,
        },
        testArgs,
        followProfile
    );
};
