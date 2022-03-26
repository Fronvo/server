// ******************** //
// The test file for the fetchProfileData event.
// ******************** //

import { TestArguments } from 'interfaces/test';

export default ({ socket, done, assert, shared }: TestArguments): void => {
    const profileId = shared.profileId;

    socket.emit('fetchProfileData', { profileId }, ({ err, profileData }): void => {
        assert(!err && typeof(profileData) == 'object');
        assert((profileData.email, profileData.username, profileData.creationDate));

        done();
    });

}
