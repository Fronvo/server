// ******************** //
// The test file for the logout event.
// ******************** //

module.exports = ({ socket, done, assert }) => {

    socket.emit('logout', ({ err }) => {
        assert(!err);
        done();
    });
}
