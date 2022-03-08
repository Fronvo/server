// ******************** //
// The logout account-only event file.
// ******************** //

const { logoutSocket } = require('../../other/utilities');

function logout({ io, socket }) {
    logoutSocket(io, socket);
    return {};
}

module.exports = { func: logout }
