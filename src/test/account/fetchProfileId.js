// ******************** //
// The test file for the fetchProfileId event.
// ******************** //

const shared = require('./../shared');

module.exports = ({ socket, done, assert }) => {

    socket.emit('fetchProfileId', ({ err, profileId }) => {
        assert(!err && typeof(profileId) == 'string');
        
        shared.profileId = profileId;
        done();
    });

}
