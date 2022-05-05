// ******************** //
// The test file for the isLoggedIn event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { assertEquals, assertError, assertErrors } from 'test/utilities';

function isLoggedIn(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('isLoggedIn', ({ err, loggedIn }) => {
        callback(assertError({ err }));

        callback(assertEquals({ loggedIn }, true));

        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, isLoggedIn);
};
