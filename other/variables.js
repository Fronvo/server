// ******************** //
// Reusable variables to lower code redundancy in other files.
// ******************** //

const errors = require('../other/errors');
const { enums } = require('../other/enums');
const { resolve } = require('path');

const generatedFilesDirectory = resolve(__dirname, '../generated');

function decideBooleanEnvValue(value, valueIfNull) {
    return value == null ? valueIfNull : (value.toLowerCase() == 'true' ? true : false);
}

module.exports = {
    // Associating accounts with sockets, format: {socketId: accountId}
    loggedInSockets: {},
    
    defaultError: {msg: errors.ERR_UNKNOWN, code: enums.ERR_UNKNOWN},

    // Passwords
    mainBcryptHash: 12,

    // Performance logs for functions
    performanceReportsEnabled: decideBooleanEnvValue(process.env.FRONVO_PERFORMANCE_REPORTS, false),

    // Storage of temporary performance reports if applicable
    performanceReports: {},

    // Minimum performance log'd function ms duration in order to be uploaded
    performanceReportsMinMS: parseInt(process.env.FRONVO_PERFORMANCE_REPORTS_MIN_MS) || -1,

    // When using PM2 for production
    cluster: process.env.TARGET_PM2 == 'true' || false,

    generatedFilesDirectory,

    // Blacklisted emails: https://github.com/disposable-email-domains/disposable-email-domains
    blacklistedEmailDomains: require(resolve(generatedFilesDirectory, 'disposable_email_blocklist.json')),
    blacklistedEmailDomainsEnabled: decideBooleanEnvValue(process.env.FRONVO_EMAIL_BLACKLISTING_ENABLED, true),

    silentLogging: decideBooleanEnvValue(process.env.FRONVO_SILENT_LOGGING, false)
}
