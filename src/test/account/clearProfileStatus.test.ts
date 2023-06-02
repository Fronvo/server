// ******************** //
// The test file for the clearProfileStatus event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { assertError, assertErrors } from 'test/utilities';

function clearProfileStatus(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('clearProfileStatus', ({ err }) => {
        callback(assertError({ err }));

        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, clearProfileStatus);
};
