// ******************** //
// The test file for the register event.
// ******************** //

module.exports = ({ socket, done, assert, shared }) => {
    const email = shared.email;
    const password = shared.password;
    
    // Safe check
    socket.emit('logout');

    socket.emit('register', { email, password }, ({ err, token }) => {
        assert(!err && typeof(token) == 'string');
        done();
    });
}
