// ******************** //
// Used by generateError to provided error context.
// ******************** //

// Remember to util.format() depending on the error's symbols.
export default {
    UNKNOWN: 'An unknown error has occured.',
    MUST_BE_LOGGED_IN: 'You must login first before using this event.',
    MUST_BE_LOGGED_OUT: 'You must logout first before using this event.',
    MISSING_ARGS: 'Some event arguments are missing.',
    RATELIMITED: 'You are ratelimited.',
    REQUIRED: 'The %s is required.',
    LENGTH: 'The %s must contain %i to %i characters.',
    EXACT_LENGTH: 'The %s must consist of exactly %i characters.',
    INVALID_EMAIL: 'The email provided is invalid.',
    INVALID_EMAIL_FORMAT: 'The email is badly formatted.',
    INVALID_PASSWORD: 'The password is invalid.',
    ACC_ALR_EXISTS: 'An account with that email already exists.',
    ACC_DOESNT_EXIST: 'The account with the specified email could not be found.',
    INVALID_REGEX: 'The %s does not consist of the expected regular expression.',
    INVALID_TOKEN: 'The token is invalid.',
    PROFILE_NOT_FOUND: 'The requested profile could not be found.'
}
