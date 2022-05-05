// ******************** //
// The test file for the logout event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { assertError, assertErrors } from 'test/utilities';

function logout(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('logout', ({ err }) => {
        callback(assertError({ err }));

        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, logout);
};
