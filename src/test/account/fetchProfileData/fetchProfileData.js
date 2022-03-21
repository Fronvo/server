// ******************** //
// The test file for the fetchProfileData event.
// ******************** //

module.exports = ({ socket, done, assert, shared }) => {
    const profileId = shared.profileId;

    socket.emit('fetchProfileData', { profileId }, ({ err, profileData }) => {
        assert(!err && typeof(profileData) == 'object');
        assert(profileData.username, profileData.creationDate, profileData.email);

        done();
    });

}
