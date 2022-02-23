// ******************** //
// Events which are usable regardless of login state.
// ******************** //

const { isSocketLoggedIn } = require('../other/utilities');

function isLoggedIn({ socket }) {
    return {loggedIn: isSocketLoggedIn(socket)};
}

module.exports = { isLoggedIn }
