// ******************** //
// The test file for the fetchProfileId event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import * as shared from 'test/shared';
import { assertError, assertErrors, assertType } from 'test/utilities';

function fetchProfileId(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('fetchProfileId', ({ err, profileId }): void => {
        callback(assertError({ err }));

        callback(assertType({ profileId }, 'string'));

        shared.setTestVariable('profileId', profileId);
        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, fetchProfileId);
};
