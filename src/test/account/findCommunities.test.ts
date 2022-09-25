// ******************** //
// The test file for the findCommunities event.
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

function lengthCommunityNameMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'findCommunities',
        {
            name: generateChars(16),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'name')
            );
        }
    );
}

function lengthMaxResultsMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'findCommunities',
        {
            name: generateChars(),
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

function findCommunities(
    { socket, done, shared }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'findCommunities',
        {
            name: shared.createdCommunityName.substring(0, 3),
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
            lengthCommunityNameMax,
            lengthMaxResultsMax,
        },
        testArgs,
        findCommunities
    );
};
