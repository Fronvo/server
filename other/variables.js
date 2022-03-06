// ******************** //
// Reusable variables to lower code redundancy in other files.
// ******************** //

const errors = require('../other/errors');
const { enums } = require('../other/enums');
const { resolve } = require('path');
const fs = require('fs');

function decideBooleanEnvValue(value, valueIfNull) {
    return value == null ? valueIfNull : (value.toLowerCase() == 'true' ? true : false);
}

const generatedFilesDirectory = resolve(__dirname, '../generated');

// Add generated paths here
const localDBDirectory = resolve(generatedFilesDirectory, 'local');
const localDBPath = resolve(localDBDirectory, 'db.json');

// File templates
const localDBTemplate = {
    accounts: [],
    tokens: [],
    reports: [],
    logs: []
};

// Reusable variables
// TODO: Make default?
const localMode = decideBooleanEnvValue(process.env.FRONVO_LOCAL_MODE, false);
const localSave = decideBooleanEnvValue(process.env.FRONVO_LOCAL_SAVE, true);

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
    cluster: decideBooleanEnvValue(process.env.TARGET_PM2, false),

    generatedFilesDirectory,

    // [directory]
    requiredStartupDirectories: [localDBDirectory],
    
    // {item: {path, template (Optional)}}
    requiredStartupFiles: [{localDBItem: {path: localDBPath, template: localDBTemplate}}],

    // Blacklisted emails: https://github.com/disposable-email-domains/disposable-email-domains
    blacklistedEmailDomains: require(resolve(generatedFilesDirectory, 'disposable_email_blocklist.json')),
    blacklistedEmailDomainsEnabled: decideBooleanEnvValue(process.env.FRONVO_EMAIL_BLACKLISTING_ENABLED, true),

    silentLogging: decideBooleanEnvValue(process.env.FRONVO_SILENT_LOGGING, false),

    // Rapid local development, no MongoDB integration
    localMode,
    localSave,

    // Checks in server.js to generate files arent fast enough, prevent errors
    localDB: localMode && localSave && fs.existsSync(localDBPath) ? require(localDBPath) : localDBTemplate,
    localDBPath
}
