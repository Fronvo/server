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
    INVALID_POST: 'The requested post was not found.',
    INVALID_PROFILE_ID: 'An account with the given ID already exists.',
    FOLLOW_SELF: "You can't follow yourself.",
    ALREADY_FOLLOWING: 'You are already following this user.',
    UNFOLLOW_SELF: "You can't unfollow yourself.",
    ALREADY_UNFOLLOWING: 'You are not following this user.',
    PROFILE_PRIVATE: 'The requested profile is private.',
    COMMUNITY_NOT_FOUND: 'The requested community could not be found.',
    ALREADY_IN_COMMUNITY: 'You have already joined a community!',
    NOT_IN_COMMUNITY: "You aren't in a community!",
    INVALID_COMMUNITY_ID: 'A community with the given ID already exists.',
    NOT_COMMUNITY_OWNER: "You don't own this community!",
    INVALID_MESSAGE: 'The requested message was not found.',
    NO_CHAT_PERMISSION:
        "The community owner hasn't accepted your chat request.",
    NOT_IN_THIS_COMMUNITY: "The target profile isn't in this community.",
    ACCOUNT_DISABLED: 'This account has been disabled.',
    NOT_ADMIN: "You aren't an admin.",
    ACCOUNT_NOT_ACCEPTED:
        "This account hasn't yet been accepted to join Fronvo.",
    REQUEST_DOESNT_EXIST: "The target request couldn't be found.",
};

export default errors;
