// ******************** //
// Used in combination with enums.js to output complete error messages.
// ******************** //

// Remember to require('util').format() depending on the error's symbols.
module.exports = {
    ERR_UNKNOWN: 'An unknown error has occured.',
    ERR_FUNC_RETURN_NONE: 'Registered event \'%s\' didn\'t return any value or the value format is invalid.', 
    ERR_REQUIRED: 'The %s is required.',
    ERR_LENGTH: 'The %s must contain %i to %i characters.',
    ERR_EXACT_LENGTH: 'The %s must consist of exactly %i characters.',
    ERR_INVALID_EMAIL: 'The email provided is invalid.',
    ERR_INVALID_EMAIL_FORMAT: 'The email is badly formatted.',
    ERR_ACC_ALR_EXISTS: 'An account with that email already exists.',
    ERR_ACC_DOESNT_EXIST: 'The account with the specified email could not be found.',
    ERR_INVALID_PASSWORD: 'The password is invalid.',
    ERR_INVALID_REGEX: 'The %s does not consist of the expected regular expression.',
    ERR_INVALID_TOKEN: 'The token is invalid.',
    ERR_MISSING_ARGS: 'The following arguments are missing: ',
    ERR_MUST_BE_LOGGED_IN: 'You must login first before using this event.',
    ERR_MUST_BE_LOGGED_OUT: 'You must logout first before using this event.',
    ERR_PROFILE_NOT_FOUND: 'The requested profile could not be found.'
}
