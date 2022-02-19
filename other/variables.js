const errors = require('../other/errors');
const { enums } = require('../other/enums');
const { resolve } = require('path');

const generatedFilesDirectory = resolve(__dirname, '../generated');

module.exports = {
    // Connected accounts for each socket (socketId: accountId)
    loggedInSockets: {},
    
    defaultError: {msg: errors.ERR_UNKNOWN, code: enums.ERR_UNKNOWN},

    // passwords
    mainBcryptHash: 12,

    // logging of performance for every function
    performanceReportsEnabled: Boolean(process.env.FRONVO_PERFORMANCE_REPORTS) || false,

    // storage of temporary performance reports
    performanceReports: {},

    // min performance report ms to be logged
    performanceReportsMinMS: parseInt(process.env.FRONVO_PERFORMANCE_REPORTS_MIN_MS) || -1,

    cluster: process.env.TARGET_PM2 == 'true' || false,

    generatedFilesDirectory: generatedFilesDirectory,

    // blacklisted emails, https://github.com/disposable-email-domains/disposable-email-domains
    blacklistedEmailDomains: require(resolve(generatedFilesDirectory, 'disposable_email_blocklist.json'))
}
