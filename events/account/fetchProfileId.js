// ******************** //
// The fetchProfileId account-only event file.
// ******************** //

const { getLoggedInSockets } = require('../../other/utilities');

function fetchProfileId({ socket }) {
    // According to variables.js comment on loggedInSockets fill method
    return {profileId: getLoggedInSockets()[socket.id]};
}

module.exports = { func: fetchProfileId }
