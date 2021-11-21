const { isSocketLoggedIn } = require('../other/utilities');

module.exports = {
    isLoggedIn: (socket, mdb) => {
        return [isSocketLoggedIn(socket)];
    }
}
