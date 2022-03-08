// ******************** //
// The test file for the login event.
// ******************** //

// Manual variable change
const shared = require('./../shared');

module.exports = ({ socket, done, assert }) => {
    const email = shared.email;
    const password = shared.password;
    
    socket.emit('logout');

    socket.emit('login', { email, password}, ({ err, token }) => {
        assert(!err && typeof(token) == 'string');
        
        shared.token = token;
        done();
    });
}
