const errors = require('../other/errors');
const { enums } = require('../other/enums');

module.exports = {
    // Connected accounts for each socket (socketId: {'accountId': accountId})
    loggedInSockets: {},
    
    defaultError: {msg: errors.ERR_UNKNOWN, code: enums.ERR_UNKNOWN},

    // passwords
    mainBcryptHash: 12,

    // tokens
    secondaryBcryptHash: 8
}
