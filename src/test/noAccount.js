// ******************** //
// The no-account-only function tests for the Fronvo server.
// ******************** //

// Put all of the event test files here
const register = require('./noAccount/register');
const login = require('./noAccount/login');
const loginToken  = require('./noAccount/loginToken');

module.exports = { register, login, loginToken }
