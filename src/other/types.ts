// ******************** //
// Types for all kinds of files.
// ******************** //

export type Errors =
    | 'UNKNOWN'
    | 'LOGGED_IN'
    | 'LOGGED_OUT'
    | 'MISSING'
    | 'REQUIRED'
    | 'LENGTH'
    | 'LENGTH_EXACT'
    | 'NOT_BOOLEAN'
    | 'INVALID'
    | 'INVALID_REGEX'
    | 'EMAIL_TAKEN'
    | 'ID_TAKEN'
    | 'ACCOUNT_404'
    | 'ROOM_404'
    | 'ALREADY_IN_ROOM'
    | 'USER_IN_ROOM'
    | 'USER_NOT_IN_ROOM'
    | 'NOT_IN_ROOM'
    | 'ROOM_NOT_DM'
    | 'DM_EXISTS'
    | 'DM_HIDDEN'
    | 'DM_INACCESSIBLE'
    | 'NOT_OWNER'
    | 'NOT_YOURSELF'
    | 'NOT_FRIEND'
    | 'FRIEND_ALREADY_SENT'
    | 'FRIEND_ALREADY_PENDING'
    | 'FRIEND_NOT_PENDING'
    | 'FRIEND_ALREADY_ACCEPTED'
    | 'NOT_HIGHER'
    | 'TOO_MUCH'
    | 'OVER_LIMIT';

export type TestAssertTypes =
    | 'string'
    | 'boolean'
    | 'number'
    | 'function'
    | 'object';

export type EnvValues =
    | 'ADMIN_PANEL_USERNAME'
    | 'ADMIN_PANEL_PASSWORD'
    | 'PRISMA_URL'
    | 'PERFORMANCE_REPORTS'
    | 'FRONVO_PERFORMANCE_REPORTS_MIN_MS'
    | 'EMAIL_BLACKLISTING_ENABLED'
    | 'SILENT_LOGGING'
    | 'BINARY_PARSER'
    | 'LOCAL_SAVE'
    | 'TEST_MODE'
    | 'RATELIMITER_POINTS'
    | 'RATELIMITER_DURATION'
    | 'RATELIMITER_POINTS_UNAUTHORISED'
    | 'RATELIMITER_DURATION_UNAUTHORISED'
    | 'EMAIL_USERNAME'
    | 'EMAIL_PASSWORD'
    | 'SETUP_MODE';
