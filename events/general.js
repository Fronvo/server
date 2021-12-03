const { isSocketLoggedIn } = require('../other/utilities');

module.exports = {
    isLoggedIn: (io, socket, mdb) => {
        return [isSocketLoggedIn(socket)];
    }
}
