// ******************** //
// Shared variables for the test files.
// ******************** //

const { v4 } = require('uuid');

const email = v4().replace(/-/g, '') + '@gmail.com';

module.exports = {
    email,
    password: email.substring(0, 30),
    token: null,
    profileId: null
}
