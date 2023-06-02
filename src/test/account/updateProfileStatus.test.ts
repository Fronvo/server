// ******************** //
// The test file for the updateProfileStatus event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    generateChars,
} from 'test/utilities';

function lengthStatusMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileStatus',
        {
            status: generateChars(21),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'status')
            );
        }
    );
}

function updateProfileStatus(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateProfileStatus',
        {
            status: 'hello',
        },
        ({ err }) => {
            callback(assertError({ err }));

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthStatusMax,
        },
        testArgs,
        updateProfileStatus
    );
};
