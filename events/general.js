const { isSocketLoggedIn } = require('../other/utilities');

module.exports = (socket) => {
    socket.on('isLoggedIn', (callback) => {
        if(typeof(callback) !== 'function') return;

        callback(isSocketLoggedIn(socket));
    });
}
