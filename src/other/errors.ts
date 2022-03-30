// ******************** //
// Used in combination with enums.js to output complete error messages.
// ******************** //

// Remember to require('util').format() depending on the error's symbols.
export const ERR_UNKNOWN = 'An unknown error has occured.';
export const ERR_RATELIMITED = 'You are ratelimited.';
export const ERR_LOCAL_DB_FAIL = 'Failed to save the local database.';
export const ERR_FUNC_RETURN_NONE = 'Registered event \'%s\' didn\'t return any value or the value format is invalid.'; 
export const ERR_REQUIRED = 'The %s is required.';
export const ERR_LENGTH = 'The %s must contain %i to %i characters.';
export const ERR_EXACT_LENGTH = 'The %s must consist of exactly %i characters.';
export const ERR_INVALID_EMAIL = 'The email provided is invalid.';
export const ERR_INVALID_EMAIL_FORMAT = 'The email is badly formatted.';
export const ERR_ACC_ALR_EXISTS = 'An account with that email already exists.';
export const ERR_ACC_DOESNT_EXIST = 'The account with the specified email could not be found.';
export const ERR_INVALID_PASSWORD = 'The password is invalid.';
export const ERR_INVALID_REGEX = 'The %s does not consist of the expected regular expression.';
export const ERR_INVALID_TOKEN = 'The token is invalid.';
export const ERR_MISSING_ARGS = 'The following arguments are missing: ';
export const ERR_MUST_BE_LOGGED_IN = 'You must login first before using this event.';
export const ERR_MUST_BE_LOGGED_OUT = 'You must logout first before using this event.';
export const ERR_PROFILE_NOT_FOUND = 'The requested profile could not be found.'
