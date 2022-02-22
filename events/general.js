// ******************** //
// Events which are usable regardless of login state.
// ******************** //

const { isSocketLoggedIn } = require('../other/utilities');

function isLoggedIn(io, socket, mdb) {
    return [isSocketLoggedIn(socket)];
}

module.exports = {
    isLoggedIn: isLoggedIn
}
