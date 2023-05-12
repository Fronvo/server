// ******************** //
// Used by generateError to provided error context.
// ******************** //

import { Errors } from './types';

// Remember to util.format() depending on the error's symbols.
const errors: { [Error in Errors] } = {
    UNKNOWN: 'An unknown error has occured.',
    MUST_BE_LOGGED_IN: 'You must login first before using this event.',
    MUST_BE_LOGGED_OUT: 'You must logout first before using this event.',
    MISSING_ARGUMENTS: 'Some arguments are missing.',
    REQUIRED: 'The %s is required.',
    REQUIRED_EMAIL: 'An email is required.',
    REQUIRED_UUID: 'A UUID is required.',
    LENGTH: 'The %s must contain %i to %i characters.',
    EXACT_LENGTH: 'The %s must consist of exactly %i characters.',
    NOT_BOOLEAN: 'The provided value must be a boolean',
    INVALID_PASSWORD: 'The password is invalid.',
    ACCOUNT_ALREADY_EXISTS: 'An account with that email already exists.',
    ACCOUNT_DOESNT_EXIST:
        'The account with the specified email could not be found.',
    INVALID_REGEX: 'The %s contains invalid characters.',
    INVALID_TOKEN: 'The token is invalid.',
    PROFILE_NOT_FOUND: 'The requested profile could not be found.',
    INVALID_CODE: 'The provided code is invalid.',
    INVALID_IMAGE_URL: 'The provided %s URL is invalid.',
    INVALID_PROFILE_ID: 'An account with the given ID already exists.',
    ROOM_NOT_FOUND: 'The requested room could not be found.',
    ALREADY_IN_ROOM: 'You have already joined a room!',
    NOT_IN_ROOM: "You aren't in a room!",
    INVALID_ROOM_ID: 'A room with the given ID already exists.',
    NOT_ROOM_OWNER: "You don't own this room!",
    INVALID_MESSAGE: 'The requested message was not found.',
    NOT_IN_THIS_ROOM: "The target profile isn't in this room.",
    NOT_HIGHER_NUMBER:
        "The '%s' parameter must be a higher number than parameter '%s'.",
    TOO_MUCH_LOAD: "You can't load more than %i %s.",
    ROOM_BAN: 'You have been banned from this room.',
    MEMBER_NOT_BANNED: 'This member has not been banned from this room.',
};

export default errors;
