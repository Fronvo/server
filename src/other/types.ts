// ******************** //
// Types for all kinds of files.
// ******************** //

export type Errors =
    | 'UNKNOWN'
    | 'MUST_BE_LOGGED_IN'
    | 'MUST_BE_LOGGED_OUT'
    | 'MISSING_ARGUMENTS'
    | 'REQUIRED'
    | 'REQUIRED_EMAIL'
    | 'REQUIRED_UUID'
    | 'LENGTH'
    | 'EXACT_LENGTH'
    | 'NOT_BOOLEAN'
    | 'INVALID_PASSWORD'
    | 'ACCOUNT_ALREADY_EXISTS'
    | 'ACCOUNT_DOESNT_EXIST'
    | 'INVALID_REGEX'
    | 'INVALID_TOKEN'
    | 'PROFILE_NOT_FOUND'
    | 'INVALID_CODE'
    | 'INVALID_IMAGE_URL'
    | 'INVALID_POST'
    | 'INVALID_PROFILE_ID'
    | 'FOLLOW_SELF'
    | 'ALREADY_FOLLOWING'
    | 'UNFOLLOW_SELF'
    | 'ALREADY_UNFOLLOWING'
    | 'PROFILE_PRIVATE'
    | 'COMMUNITY_NOT_FOUND'
    | 'ALREADY_IN_COMMUNITY'
    | 'NOT_IN_COMMUNITY'
    | 'INVALID_COMMUNITY_ID'
    | 'NOT_COMMUNITY_OWNER'
    | 'INVALID_MESSAGE'
    | 'NO_CHAT_PERMISSION'
    | 'NOT_IN_THIS_COMMUNITY';

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
    | 'TARGET_PM2'
    | 'EMAIL_USERNAME'
    | 'EMAIL_PASSWORD';
