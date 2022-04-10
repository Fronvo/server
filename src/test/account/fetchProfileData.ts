// ******************** //
// The test file for the fetchProfileData event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { assertCode, assertError, assertErrors, assertNotEqual, assertType } from 'utilities/test';
import { v4 } from 'uuid';

function profileNotFound({ socket }: Partial<TestArguments>, callback: TestErrorCallback): void {
    socket.emit('fetchProfileData', {
        profileId: v4()
    }, ({ err }) => {
        callback(assertCode(err.code, 'PROFILE_NOT_FOUND'));
    });
}

function fetchProfileData({ socket, done, shared }: TestArguments, callback: TestErrorCallback): void {    
    socket.emit('fetchProfileData', {
        profileId: shared.profileId
    }, ({ err, profileData }): void => {
        callback(assertError({err}));
        
        callback(assertType({email: profileData.email}, 'string')
        || assertType({username: profileData.username}, 'string')
        || assertNotEqual({creationDate: new Date(profileData.creationDate)}, 'Invalid Date'));

        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({
        profileNotFound
    }, testArgs, fetchProfileData);
}
