// ******************** //
// The test file for the loginToken event.
// ******************** //

module.exports = ({ socket, done, assert, shared }) => {
    const token = shared.token;

    socket.emit('logout');

    socket.emit('loginToken', { token }, ({ err }) => {
        assert(!err);
        done();
    });
}
