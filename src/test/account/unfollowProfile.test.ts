// ******************** //
// The test file for the unfollowProfile event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
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
        'unfollowProfile',
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
        'unfollowProfile',
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
        'unfollowProfile',
        {
            profileId: generateChars(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'PROFILE_NOT_FOUND'));
        }
    );
}

function unfollowSelf(
    { socket, shared }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'unfollowProfile',
        {
            profileId: shared.profileId,
        },
        ({ err }) => {
            callback(assertCode(err.code, 'UNFOLLOW_SELF'));
        }
    );
}

// TODO
// function alreadyFollowing(
//     { socket }: Partial<TestArguments>,
//     callback: TestErrorCallback
// ): void {
//     socket.emit(
//         'followProfile',
//         {
//             profileId: generateChars(),
//         },
//         ({ err }) => {
//             callback(assertCode(err.code, 'ALREADY_FOLLOWING'));
//         }
//     );
// }

function unfollowProfile(
    { socket, done, shared }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'unfollowProfile',
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
            unfollowSelf,
        },
        testArgs,
        unfollowProfile
    );
};
