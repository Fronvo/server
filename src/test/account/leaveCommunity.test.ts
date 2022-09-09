// ******************** //
// The test file for the leaveCommunity event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { assertError, assertErrors } from 'test/utilities';

function leaveCommunity(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('leaveCommunity', ({ err }) => {
        callback(assertError({ err }));

        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, leaveCommunity);
};
