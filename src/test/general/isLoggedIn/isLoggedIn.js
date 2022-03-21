// ******************** //
// The test file for the isLoggedIn event.
// ******************** //

module.exports = ({ socket, done, assert }) => {
    socket.emit('isLoggedIn', ({ loggedIn }) => {
        assert(typeof(loggedIn) == 'boolean');
        done();
    });
}
