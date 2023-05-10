// ******************** //
// The test file for the leaveRoom event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { assertError, assertErrors } from 'test/utilities';

function leaveRoom(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('leaveRoom', ({ err }) => {
        callback(assertError({ err }));

        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, leaveRoom);
};
