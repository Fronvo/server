// ******************** //
// The test file for the fetchHomePosts event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { assertError, assertErrors, assertType } from 'test/utilities';

function fetchHomePosts(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('fetchHomePosts', ({ err, homePosts }): void => {
        callback(assertError({ err }));

        callback(assertType({ homePosts }, 'object'));

        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, fetchHomePosts);
};
