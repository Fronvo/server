// ******************** //
// Used by generateError to provided error context.
// ******************** //

import { Errors } from './types';

// Remember to util.format() depending on the error's symbols.
const errors: { [Error in Errors] } = {
    UNKNOWN: 'Unknown error.',

    LOGGED_IN: 'Login first.',
    LOGGED_OUT: 'Logout first.',

    MISSING: 'Missing arguments.',

    REQUIRED: 'The %s is required.',

    LENGTH: 'The %s must contain %i to %i characters.',
    LENGTH_EXACT: 'The %s must consist of exactly %i characters.',

    NOT_BOOLEAN: 'Must be a boolean',

    INVALID: 'Invalid %s.',
    INVALID_REGEX: 'The %s contains invalid characters.',

    EMAIL_TAKEN: 'Email taken.',
    ID_TAKEN: 'This ID has been taken.',

    ACCOUNT_404: 'Account not found.',

    ALREADY_IN_ROOM: 'Already in a room.',
    NOT_IN_ROOM: 'Not in a room.',
    NOT_OWNER: 'Not the owner of this room',
    NOT_IN_THIS_ROOM: 'Profile ID not found in this room.',

    NOT_HIGHER: "The '%s' must be higher than the '%s'.",

    TOO_MUCH: 'Load less than %i %s.',
};

export default errors;
