// ******************** //
// Used by generateError to provided error context.
// ******************** //

import { Errors } from './types';

// Remember to util.format() depending on the error's symbols.
const errors: { [Error in Errors] } = {
    UNKNOWN: 'An unknown error has occured.',
    MUST_BE_LOGGED_IN: 'You must login first before using this event.',
    MUST_BE_LOGGED_OUT: 'You must logout first before using this event.',
    MISSING_ARGUMENTS: 'Some event arguments are missing.',
    RATELIMITED: 'You are ratelimited.',
    REQUIRED: 'The %s is required.',
    REQUIRED_EMAIL: 'An email is required.',
    REQUIRED_UUID: 'A UUID is required.',
    LENGTH: 'The %s must contain %i to %i characters.',
    EXACT_LENGTH: 'The %s must consist of exactly %i characters.',
    INVALID_PASSWORD: 'The password is invalid.',
    ACCOUNT_ALREADY_EXISTS: 'An account with that email already exists.',
    ACCOUNT_DOESNT_EXIST:
        'The account with the specified email could not be found.',
    INVALID_REGEX:
        'The %s does not consist of the expected regular expression.',
    INVALID_TOKEN: 'The token is invalid.',
    PROFILE_NOT_FOUND: 'The requested profile could not be found.',
    INVALID_CODE: 'The provided code is invalid.',
};

export default errors;
