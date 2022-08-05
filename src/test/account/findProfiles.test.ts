// ******************** //
// The test file for the fetchProfilePosts event.
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

function lengthProfileIdMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'findProfiles',
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

function lengthMaxResultsMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'findProfiles',
        {
            profileId: generateChars(),
            maxResults: '1233',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'maxResults')
            );
        }
    );
}

function findProfiles(
    { socket, done, shared }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'findProfiles',
        {
            profileId: shared.secondaryProfileId,
        },
        ({ err, findResults }): void => {
            callback(assertError({ err }));

            callback(assertType({ findResults }, 'object'));

            for (const result in findResults) {
                callback(
                    assertType({ findResults: findResults[result] }, 'string')
                );
            }

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthProfileIdMax,
            lengthMaxResultsMax,
        },
        testArgs,
        findProfiles
    );
};
