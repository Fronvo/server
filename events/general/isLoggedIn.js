// ******************** //
// The isLoggedIn general event file.
// ******************** //

const { isSocketLoggedIn } = require('../../other/utilities');

function isLoggedIn({ socket }) {
    return {loggedIn: isSocketLoggedIn(socket)};
}

module.exports = isLoggedIn;
