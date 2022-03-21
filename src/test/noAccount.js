// ******************** //
// The no-account-only function tests for the Fronvo server.
// ******************** //

// Put all of the event test files here
const register = require('./noAccount/register/register');
const login = require('./noAccount/login/login');
const loginToken  = require('./noAccount/loginToken/loginToken');

module.exports = { register, login, loginToken }
