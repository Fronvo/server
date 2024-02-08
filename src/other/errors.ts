// ******************** //
// Used by generateError to provided error context.
// ******************** //

import { Errors } from './types';

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
    ROOM_404: 'Room not found.',
    SERVER_404: 'Server not found.',
    POST_404: 'Post not found.',
    THEME_404: 'Theme not found.',
    THEME_EXISTS: 'Theme already exists.',

    NOT_POST_CREATOR: "You didn't create this post.",
    POST_BOTH_TYPES: 'Choose one attachment type.',

    ALREADY_IN_ROOM: 'You are already in this room.',
    ALREADY_IN_SERVER: 'You are already in this server.',
    USER_IN_ROOM: 'User already in this room.',
    USER_NOT_IN_ROOM: 'User not in this room.',
    NOT_IN_ROOM: 'Not in this room.',
    NOT_IN_SERVER: 'Not in this server.',
    ROOM_NOT_DM: 'This is a DM not a room.',
    DM_EXISTS: 'This DM already exists.',
    DM_HIDDEN: 'This DM is already hidden from you.',
    DM_INACCESSIBLE: "This DM can't be accessed.",
    NOT_OWNER: 'Not the owner.',
    NOT_YOURSELF: "You can't do this to yourself.",
    NOT_FRIEND: 'Not your friend.',
    OVER_FRIENDS_LIMIT: 'You have reached the friend limit.',

    FRIEND_ALREADY_SENT: 'This user has already sent you a friend request.',
    FRIEND_ALREADY_PENDING: 'Friend request already sent.',
    FRIEND_NOT_PENDING: 'No request is pending.',
    FRIEND_ALREADY_ACCEPTED: 'Already your friend.',

    NOT_HIGHER: "The '%s' must be higher than the '%s'.",
    TOO_MUCH: 'Load less than %i %s.',
    DO_AGAIN: 'Do this again in %i %s.',
    OVER_LIMIT: "Can't do more of those.",

    NOT_IN_BETA: "You haven't joined the BETA account list.",
    DISABLED_IN_BETA: 'This feature is disabled while in BETA.',

    PRO_REQUIRED: "You aren't a PRO",
    NOT_FRONVO: "You aren't that guy.",

    SERVER_INVITES_DISABLED: 'This server has turned invites off.',
};

export default errors;
