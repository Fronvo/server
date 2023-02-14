// ******************** //
// The test file for the showBannedMembers event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { assertError, assertErrors, assertType } from 'test/utilities';

function showBannedMembers(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit('showBannedMembers', ({ bannedMembers, err }) => {
        callback(assertError({ err }));

        const targetMember = bannedMembers[0];

        callback(assertType({ avatar: targetMember.avatar }, 'string'));

        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, showBannedMembers);
};
