const errors = require('../other/errors');
const { General } = require('../other/enums');

module.exports = {
    // Connected accounts for each socket (socketId: {'accountId': accountId})
    loggedInSockets: {},
    
    defaultError: {msg: errors.ERR_UNKNOWN, code: General.ERR_UNKNOWN.value}
}
